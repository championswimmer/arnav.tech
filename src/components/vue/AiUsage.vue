<script setup lang="ts">
type AiUsageType = 'ai-assisted' | 'ai-generated' | 'ai-free';

const props = defineProps<{ type: AiUsageType }>();

// Tabler icon SVG bodies, inlined because astro-icon's <Icon> is Astro-only
// and this is a Vue island. Paths are from @iconify-json/tabler.
const icons: Record<AiUsageType, string> = {
	'ai-free':
		'<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 17V5c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2zM16 7h4m-2 12H5a2 2 0 1 1 0-4h4a2 2 0 1 0 0-4H6"/>',
	'ai-assisted':
		'<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2m0-12a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2M9 18a6 6 0 0 1 6-6a6 6 0 0 1-6-6a6 6 0 0 1-6 6a6 6 0 0 1 6 6"/>',
	'ai-generated':
		'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M10 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v3.5M9 9h1m-1 4h2.5M9 17h1"/><path d="M14 21v-4a2 2 0 1 1 4 0v4m-4-2h4m3-4v6"/></g>',
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
