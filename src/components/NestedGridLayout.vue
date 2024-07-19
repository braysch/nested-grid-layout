<template #item="{ item: dashboard }">
    <div class="bg-green-800 w-full select-none" ref="dashboard">
        <GridHeader class="header" :type=0 title="Dashboard" :onAdd="addPanel" :onEdit="recompose"></GridHeader>
        <GridLayout :layout="layout" :col-num="1" :row-height="30" :is-draggable="true" :is-resizable="false"
            @layout-updated="() => { 'dashboard layout updated!' }">
            <GridItem class="w-full h-full rounded-sm bg-gray-300 shadow-offset" v-for="panel in this.layout"
                :key="panel.i" :x="panel.x" :y="panel.y" :w="panel.w" :h="panel.h" :i="panel.i" :min-h="2"
                :min-w="panel.minW" :max-w="panel.maxW" :drag-allow-from="'.header'" :data-panel-id="panel.i">
                <GridHeader class="header" :type=1 :title="'Panel ' + panel.i" :onAdd="() => {
                    addWidget(panel);
                }" :onDelete="() => { deletePanel(panel.i, layout); }">
                </GridHeader>
                <GridLayout :layout="panel.childLayout" :col-num="12" :row-height="30" :is-draggable="true"
                    :is-resizable="true" @layout-updated="() => {
                        console.log('panel layout updated!')
                        this.adjustPanelHeight(panel)
                    }">
                    <GridItem class="w-full h-full rounded-sm bg-white shadow-offset"
                        v-for="widget in panel.childLayout" :key="widget.i" :x="widget.x" :y="widget.y" :w="widget.w"
                        :h="widget.h" :i="widget.i" :min-h="widget.minH" :min-w="widget.minW" :max-w="widget.maxW"
                        :max-h="widget.maxH" :drag-allow-from="'.header'" :data-widget-id="widget.i"
                        v-on:mousedown="() => { updateZIndex(panel, widget) }"
                        v-on:mouseup="() => { resetZIndex(panel, widget) }">
                        <GridHeader class="header" :type=2 :title="'Widget ' + widget.i" :onAdd="() => {
                            addComponent(widget);
                        }" :onDelete="() => {
                            deleteWidget(widget.i, panel);
                        }">
                        </GridHeader>
                        <GridLayout v-model:layout="widget.childLayout" :col-num="12" :row-height="30"
                            :is-draggable="true" :is-resizable="true" @layout-updated="() => {
                                console.log('widget layout updated!')
                                this.adjustWidgetHeight(widget, panel)
                            }">
                            <GridItem class="w-full h-full rounded-sm bg-green-400 shadow-offset"
                                v-for="component in widget.childLayout" :key="component.i" :x="component.x"
                                :y="component.y" :w="component.w" :h="component.h" :i="component.i"
                                :min-h="component.minH" :min-w="component.minW" :max-w="component.maxW"
                                :drag-allow-from="'.header'" v-on:mousedown="() => { updateZIndex(panel, widget) }"
                                v-on:mouseup="() => { resetZIndex(panel, widget) }">
                                <GridHeader class="header" :type=3 :title="'Component ' + component.i"
                                    :isComponent="true" :onDelete="() => {
                                        deleteComponent(component.i, widget);
                                    }">
                                </GridHeader>
                                <div class="p-2">
                                    Content
                                </div>
                            </GridItem>
                        </GridLayout>
                    </GridItem>
                </GridLayout>
            </GridItem>
        </GridLayout>
    </div>
</template>

<style scoped>
.vgl-layout {
    --vgl-placeholder-bg: green;
}
</style>

<script lang="ts">
import { ref, watch, onMounted } from 'vue';
import { reactive } from 'vue';
import GridHeader from './GridHeader.vue'; // Ensure correct path
import { GridLayout, GridItem } from 'grid-layout-plus';
import { nextTick } from 'vue';

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
            delay: 2000,
            dragging: false
        };
    },
    watch: {
        layout(newValue) {
            this.layout = newValue;
        }
    },
    methods: {
        updateZIndex(panel, widget) {
            const panelElement = this.$refs.dashboard.querySelector(`[data-panel-id="${panel.i}"]`);
            const widgetElement = panelElement.querySelector(`[data-widget-id="${widget.i}"]`);
            panelElement.style.zIndex = "100"
            widgetElement.style.zIndex = '50'
        },
        resetZIndex(panel, widget) {
            console.log("reset")
            const panelElement = this.$refs.dashboard.querySelector(`[data-panel-id="${panel.i}"]`);
            //const widgetElement = panelElement.querySelector(`[data-widget-id="${widget.i}"]`);
            panelElement.style.zIndex = "0"
            console.log(panelElement)
            //widgetElement.style.zIndex = '0'
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
            });
        },
        deletePanel(id, layout) {
            const index = layout.findIndex(panel => panel.i === id)
            if (index !== -1) {
                layout.splice(index, 1)
            }
        },
        adjustItemHeight(layout) {
            var adjustedHeight = this.getNextY(layout.childLayout) + 1
            layout.h = adjustedHeight > 2 ? adjustedHeight : 2
            layout.minH = layout.h
        },
        adjustWidgetHeight(widget, panel) {
            widget.maxH = this.getNextY(widget.childLayout) + 1 > 2 ? this.getNextY(widget.childLayout) + 1 : 2
            console.log("Adjust widget height")
            this.adjustItemHeight(widget)
            panel.childLayout = [...panel.childLayout] // need this for widgets to update properly when adding a component
            this.adjustItemHeight(panel)
            this.recompose()
        },
        adjustPanelHeight(panel) {
            console.log("Adjust panel height")
            this.adjustItemHeight(panel)
            this.recompose()
        },
        addWidget(panel) {
            let position = this.getNextXY(panel.childLayout)
            panel.childLayout.push({
                x: position.x,
                y: position.y,
                w: 3,
                h: 2,
                minH: 2,
                maxH: 2,
                minW: 3,
                maxW: 12,
                i: this.getNextWidgetIndex(this.layout),
                childLayout: [],
            });
        },
        deleteWidget(id, panel) {
            const index = panel.childLayout.findIndex(widget => widget.i === id)
            if (index != -1) {
                panel.childLayout.splice(index, 1)
            }
        },
        addComponent(widget) {
            widget.childLayout.push({
                x: 0,
                y: this.getNextY(widget.childLayout),
                w: 12,
                h: 2,
                minH: 2,
                minW: 12,
                i: this.getNextComponentIndex(this.layout),
                childLayout: null,
            });
        },
        deleteComponent(id, widget) {
            const index = widget.childLayout.findIndex(widget => widget.i === id)
            if (index != -1) {
                widget.childLayout.splice(index, 1)
            }
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
