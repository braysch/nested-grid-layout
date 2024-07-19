<template>
    <div class="bg-gray-800 text-white flex justify-between h-5 items-center text-sm px-2 rounded-t-sm"
        @mousedown="onDragStart" @mouseup="onDragStop">
        <div class="text-left">{{ title }}</div>
        <div class="text-right">
            <div @mouseenter="onHoverEnter" @mouseleave="onHoverLeave">
                <span v-if="!isComponent" class="mr-2 cursor-pointer"
                    :title="`Add ${this.getTypeString(this.type + 1)}`" @click="onAdd">Add</span>
                <span class="mr-2 cursor-pointer" :title="`Edit ${this.getTypeString(this.type)}`"
                    @click="onEdit">Edit</span>
                <span class="cursor-pointer" :title="`Delete ${this.getTypeString(this.type)}`"
                    @click="onDelete">Delete</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GridHeader',
    props: {
        title: {
            type: String,
            required: true
        },
        onAdd: {
            type: Function,
            required: false
        },
        onEdit: {
            type: Function,
            required: true
        },
        onDelete: {
            type: Function,
            required: true
        },
        isComponent: {
            type: Boolean,
            required: false
        },
        isDashboard: {
            type: Boolean,
            required: false
        },
        type: { // 0-dashboard, 1-panel, 2-widget, 3-component
            type: Number,
            required: true
        },
        onDragStart: {
            type: Function,
            required: false
        },
        onDragStop: {
            type: Function,
            required: false
        }
    },
    data() {
        return {
            dragging: false
        };
    },
    methods: {
        getTypeString(type) {
            if (type == 0) { return "dashboard"; }
            else if (type == 1) { return "panel"; }
            else if (type == 2) { return "widget"; }
            else if (type == 3) { return "component"; }
            else { return "undefined"; }
        },
    }
}
</script>

<style scoped>
/* Add your styles here if needed */
</style>
