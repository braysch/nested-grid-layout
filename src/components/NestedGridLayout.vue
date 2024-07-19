<template #item="{ item: dashboard }">
    <div class="bg-black w-full select-none" ref="dashboard">
        <GridHeader class="header" :type=0 title="Dashboard" :onAdd="addPanel" :onEdit="recompose"></GridHeader>
        <GridLayout :layout="layout" :col-num="1" :row-height="30" :is-draggable="true" :is-resizable="true"
            :on-drag-start="() => { console.log('start') }">
            <template #item="{ item: panel }">
                <div class="shadow-lg bg-gray-300 w-full h-full" :ref="'panel-' + panel.i">
                    <GridHeader class="header" :type=1 :title="'Panel ' + panel.i" :onAdd="() => {
                        addWidget(panel);
                    }" :onDelete="() => {
                        deletePanel(panel.i, layout);
                    }" :onDragStart="() => { onDragStart(this.$refs['panel-' + panel.i]) }"
                        :onDragStop="() => { onDragStop(this.$refs['panel-' + panel.i], () => { recompose() }) }">
                    </GridHeader>
                    <GridLayout :layout="panel.childLayout" :col-num="12" :row-height="30" :is-draggable="true"
                        :is-resizable="true">
                        <template #item="{ item: widget }">
                            <div class="shadow-lg bg-blue-400 w-full min-h-full" :ref="'widget-' + widget.i">
                                <GridHeader class="header" :type=2 :title="'Widget ' + widget.i" :onAdd="() => {
                                    addComponent(widget, panel);
                                }" :onDelete="() => {
                                    deleteWidget(widget.i, panel);
                                }" :onDragStart="() => { onDragStart(this.$refs['panel-' + panel.i]) }"
                                    :onDragStop="() => { onDragStop(this.$refs['panel-' + panel.i], () => { adjustPanelHeight(panel) }) }">
                                </GridHeader>
                                <GridLayout :layout="widget.childLayout" :col-num="12" :row-height="30"
                                    :is-draggable="true" :is-resizable="true"
                                    @resize-start="() => { console.log('resize start!') }">
                                    <template #item="{ item: component }">
                                        <div class="shadow-lg bg-green-200 w-full min-h-full"
                                            :ref="'component-' + component.i">
                                            <GridHeader class="header" :type=3 :title="'Component ' + component.i"
                                                :isComponent="true" :onDelete="() => {
                                                    deleteComponent(component.i, widget, panel);
                                                }" :onDragStart="() => { onDragStart(this.$refs['panel-' + panel.i]) }"
                                                :onDragStop="() => { onDragStop(this.$refs['panel-' + panel.i], () => { adjustWidgetHeight(widget, panel) }) }">
                                            </GridHeader>
                                            <div class="p-2">
                                                content
                                            </div>
                                        </div>
                                    </template>
                                </GridLayout>
                            </div>
                        </template>
                    </GridLayout>
                </div>
            </template>
        </GridLayout>
    </div>
</template>

<script lang="ts">
import { ref, watch, onMounted } from 'vue';
import { reactive } from 'vue';
import GridHeader from './GridHeader.vue'; // Ensure correct path
import { GridLayout, GridItem } from 'grid-layout-plus';
import { nextTick } from 'vue';

onMounted(() => {

})

export default {
    name: 'NestedGridLayout',
    components: {
        GridHeader,
        GridLayout,
        GridItem
    },
    props: {
        layout: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            layout: reactive([]),
            delay: 0,
            dragging: false
        };
    },
    watch: {
        layout(newValue) {
            this.layout = newValue;
        }
    },
    methods: {
        onDragStart(panelRef) {
            panelRef.parentElement.style.zIndex = "100"
            console.log(panelRef.parentElement)

            console.log("Dragging")
            this.dragging = true;
            document.addEventListener('mouseup', this.onDragStop);
        },
        onDragStop(panelRef, todo: Function) {
            if (this.dragging) {
                panelRef.parentElement.style.zIndex = ""
                console.log(panelRef)
                console.log("No more dragging")
                this.dragging = false;
                document.removeEventListener('mouseup', this.onDragStop);
                todo()
            }
        },
        itemModifyStart(text) {
            console.log(text + " start")
        },
        itemModifyEnd(text) {
            console.log(text + " end")
        },
        addPanel() {
            this.layout.push({
                x: 0,
                y: this.getNextY(this.layout),
                w: 12,
                h: 2,
                minH: 2,
                minW: 12,
                i: this.getNextPanelIndex(this.layout),
                childLayout: [],
                dragAllowFrom: ".header"
            });
        },
        deletePanel(id, layout) {
            const index = layout.findIndex(panel => panel.i === id)
            if (index !== -1) {
                layout.splice(index, 1)
            }
        },
        adjustPanelHeight(panelLayout) {
            console.log("Adjust panel height!")
            let adjustedHeight = this.getNextY(panelLayout.childLayout) + 1
            panelLayout.h = adjustedHeight > 2 ? adjustedHeight : 2
            this.recompose()
        },
        adjustWidgetHeight(widgetLayout, panelLayout) {
            console.log("Adjust widget height!")
            let adjustedHeight = this.getNextY(widgetLayout.childLayout) + 1
            widgetLayout.h = adjustedHeight > 2 ? adjustedHeight : 2
            widgetLayout.minH = widgetLayout.h
            // widgetLayout.maxH = widgetLayout.h
            this.adjustPanelHeight(panelLayout)
        },
        addWidget(panel) {
            let position = this.getNextXY(panel.childLayout)
            panel.childLayout.push({
                x: position.x,
                y: position.y,
                w: 3,
                h: 2,
                minH: 2,
                // maxH: 2,
                minW: 3,
                maxW: 12,
                i: this.getNextWidgetIndex(this.layout),
                childLayout: [],
                dragAllowFrom: ".header"
            });
            this.adjustPanelHeight(panel)
        },
        deleteWidget(id, panel) {
            const index = panel.childLayout.findIndex(widget => widget.i === id)
            if (index != -1) {
                panel.childLayout.splice(index, 1)
            }
            setTimeout(() => this.adjustPanelHeight(panel), this.delay)
        },
        addComponent(widget, panel) {
            widget.childLayout.push({
                x: 0,
                y: this.getNextY(widget.childLayout),
                w: 12,
                h: 2,
                minH: 2,
                minW: 12,
                i: this.getNextComponentIndex(this.layout),
                childLayout: null,
                dragAllowFrom: ".header"
            });
            // this seems kind of redundant, but right now, this is a solution
            // to make it so the widget height updates when a new component is made
            setTimeout(() => this.adjustWidgetHeight(widget, panel), this.delay)
            setTimeout(() => panel.childLayout = [...panel.childLayout], this.delay)
            setTimeout(() => this.adjustPanelHeight(panel), this.delay)

        },
        deleteComponent(id, widget, panel) {
            const index = widget.childLayout.findIndex(widget => widget.i === id)
            if (index != -1) {
                widget.childLayout.splice(index, 1)
            }
            setTimeout(() => this.adjustWidgetHeight(widget, panel), this.delay)
            setTimeout(() => panel.childLayout = [...panel.childLayout], this.delay)
            setTimeout(() => this.adjustPanelHeight(panel), this.delay)
        },
        getNextY(layout) {
            let max_y = 0
            layout.forEach(item => {
                const y = item.y + item.h;
                if (y > max_y) { max_y = y }
            })
            // console.log("next y = " + max_y)
            return max_y
        },
        getNextXY(layout) {
            let max_y = this.getNextY(layout)
            // Create a 2D array to represent the grid
            let grid = Array.from({ length: max_y }, () => Array.from({ length: 12 }, () => false));

            // Mark occupied cells in the grid based on the layout items
            layout.forEach(item => {
                let x1 = item.x;
                let y1 = item.y;
                let x2 = x1 + item.w - 1;
                let y2 = y1 + item.h - 1;

                for (let y = y1; y <= y2; y++) {
                    for (let x = x1; x <= x2; x++) {
                        grid[y][x] = true; // Marking occupied spots in the grid
                    }
                }
            });

            // Find the next available spot for a rectangle of height 2 and width 3
            let found = false;
            let x1_new = 0;
            let y1_new = 0;

            for (let y = 0; y <= grid.length - 2; y++) { // Loop through possible y positions
                for (let x = 0; x <= grid[y].length - 3; x++) { // Loop through possible x positions
                    if (!grid[y][x] && !grid[y][x + 1] && !grid[y][x + 2] &&
                        !grid[y + 1][x] && !grid[y + 1][x + 1] && !grid[y + 1][x + 2]) {
                        // Check if the 3x2 area starting from (y, x) is available
                        x1_new = x;
                        y1_new = y;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            if (!found) {
                // If there isn't space available in the grid, the next available spot is beneath the grid
                return { x: 0, y: max_y }
            }

            return { x: x1_new, y: y1_new };
        },
        getNextIndex(layout) {
            let min_i = 0;
            let prev_i = -1;

            for (let item of layout.sort((a, b) => a.i - b.i)) {
                if (item.i > min_i) { // fix this later
                    min_i = item.i // ideally, I'd like it so you can recycle deleted numbers lower than the min index
                    prev_i = item.i - 1 // but right now it just keeps going up from the lowest number
                }
                if (item.i == prev_i + 1) {
                    prev_i = item.i;
                    min_i = item.i + 1;
                } else {
                    return min_i;
                }
            }
            return min_i;
        },
        getNextPanelIndex(layout) {
            return this.getNextIndex(layout);
        },
        getNextWidgetIndex(layout) {
            var nextWidgetIndex = 0;
            var n = 0;
            layout.forEach(panel => {
                var index = this.getNextIndex(panel.childLayout)
                console.log('panel' + panel.i + ": " + index);
                if (index > nextWidgetIndex) { nextWidgetIndex = index }
            });
            console.log("next widget index: " + nextWidgetIndex)
            return nextWidgetIndex;
        },
        getNextComponentIndex(layout) {
            var nextComponentIndex = 0;
            layout.forEach(panel => {
                panel.childLayout.forEach(widget => {
                    var index = this.getNextIndex(widget.childLayout);
                    if (index > nextComponentIndex) { nextComponentIndex = index; }
                });
            });
            return nextComponentIndex;
        },
        recompose() {
            // console.log("recompose")
            nextTick(() => { this.layout = [...this.layout] }) // recompose the grid
        }
    }
};
</script>
