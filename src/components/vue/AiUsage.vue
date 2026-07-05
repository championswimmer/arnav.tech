<script setup lang="ts">
type AiUsageType = 'ai-assisted' | 'ai-generated' | 'ai-free';

const props = defineProps<{ type: AiUsageType }>();

// Tabler icon SVG bodies, inlined because astro-icon's <Icon> is Astro-only
// and this is a Vue island. Paths are from @iconify-json/tabler.
const icons: Record<AiUsageType, string> = {
	'ai-free':
		'<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 17V5c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2zM16 7h4m-2 12H5a2 2 0 1 1 0-4h4a2 2 0 1 0 0-4H6"/>',
	'ai-assisted':
		'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19.5 12.572L12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/><path d="M12 6L8.707 9.293a1 1 0 0 0 0 1.414l.543.543c.69.69 1.81.69 2.5 0l1-1a3.18 3.18 0 0 1 4.5 0l2.25 2.25m-7 3l2 2M15 13l2 2"/></g>',
	'ai-generated':
		'<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm6-4v2m-3 8v9m6-9v9M5 16l4-2m6 0l4 2M9 18h6M10 8v.01M14 8v.01"/>',
};

const config: Record<AiUsageType, { label: string; body: string }> = {
	'ai-free': {
		label: 'Human Written',
		body: 'This article is entirely written by a human, with no AI involvement in research, drafting, or editing.',
	},
	'ai-assisted': {
		label: 'AI-Assisted',
		body: 'AI was used to help with research, fact-checking, or writing certain parts of this article. The ideas, structure, and voice are the author\'s own.',
	},
	'ai-generated': {
		label: 'AI-Generated',
		body: 'This article was converted from the author\'s raw notes or outline into its final form by AI. The ideas and information originate from the author.',
	},
};

const icon = icons[props.type];
const { label, body } = config[props.type];
</script>

<template>
	<aside :class="['ai-usage', `ai-usage--${type}`]" role="note">
		<svg
			class="ai-usage__icon"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			aria-hidden="true"
			v-html="icon"
		/>
		<div class="ai-usage__text">
			<strong class="ai-usage__label">{{ label }}</strong>
			<p class="ai-usage__body">{{ body }}</p>
		</div>
	</aside>
</template>

<style scoped>
.ai-usage {
	display: flex;
	gap: 0.85em;
	align-items: flex-start;
	padding: 0.9em 1.1em;
	border-radius: 8px;
	border-left: 4px solid;
	margin: 0 0 2em;
	font-family: var(--font-sans, sans-serif);
}

.ai-usage__icon {
	width: 1.4em;
	height: 1.4em;
	flex-shrink: 0;
	margin-top: 0.1em;
	color: currentColor;
}

.ai-usage__text {
	display: flex;
	flex-direction: column;
	gap: 0.15em;
}

.ai-usage__label {
	font-size: 0.82rem;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-weight: 700;
}

.ai-usage__body {
	font-size: 0.88rem;
	line-height: 1.55;
	margin: 0;
	color: inherit;
	opacity: 0.85;
}

/* ai-free — forest green tint */
.ai-usage--ai-free {
	background: #eef4ee;
	border-color: #4a7c59;
	color: #2d4f38;
}

/* ai-assisted — slate teal, offset from the warm paper */
.ai-usage--ai-assisted {
	background: #e8f0f0;
	border-color: #3d7a7a;
	color: #234b4b;
}

/* ai-generated — muted violet, clearly distinct from sepia */
.ai-usage--ai-generated {
	background: #efeaf5;
	border-color: #6d5296;
	color: #43315f;
}
</style>
