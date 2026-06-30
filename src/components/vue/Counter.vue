<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{ start?: number; label?: string }>(), {
	start: 0,
	label: 'Count',
});

const count = ref(props.start);
</script>

<template>
	<div class="counter">
		<button @click="count--" aria-label="decrement">–</button>
		<span class="value">{{ label }}: {{ count }}</span>
		<button @click="count++" aria-label="increment">+</button>
	</div>
</template>

<style scoped>
.counter {
	display: inline-flex;
	align-items: center;
	gap: 0.75em;
	padding: 0.6em 0.9em;
	border: 1px solid var(--rule, #d9cbb0);
	border-radius: 8px;
	background: var(--paper-raised, #faf3e0);
	font-family: var(--font-mono, monospace);
}
.value {
	min-width: 8ch;
	text-align: center;
	color: var(--ink, #2b2117);
}
button {
	font-family: inherit;
	font-size: 1.1rem;
	width: 2em;
	height: 2em;
	border: 1px solid var(--accent, #9c5a34);
	color: var(--accent, #9c5a34);
	background: transparent;
	border-radius: 6px;
	cursor: pointer;
	line-height: 1;
}
button:hover {
	background: var(--accent, #9c5a34);
	color: var(--paper, #f4ecd8);
}
</style>
