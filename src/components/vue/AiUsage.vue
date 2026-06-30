<script setup lang="ts">
type AiUsageType = 'ai-assisted' | 'ai-generated' | 'ai-free';

const props = defineProps<{ type: AiUsageType }>();

const config: Record<AiUsageType, { icon: string; label: string; body: string }> = {
	'ai-free': {
		icon: '✍️',
		label: 'Human Written',
		body: 'This article is entirely written by a human, with no AI involvement in research, drafting, or editing.',
	},
	'ai-assisted': {
		icon: '🤝',
		label: 'AI-Assisted',
		body: 'AI was used to help with research, fact-checking, or writing certain parts of this article. The ideas, structure, and voice are the author\'s own.',
	},
	'ai-generated': {
		icon: '🤖',
		label: 'AI-Generated',
		body: 'This article was converted from the author\'s raw notes or outline into its final form by AI. The ideas and information originate from the author.',
	},
};

const { icon, label, body } = config[props.type];
</script>

<template>
	<aside :class="['ai-usage', `ai-usage--${type}`]" role="note">
		<span class="ai-usage__icon" aria-hidden="true">{{ icon }}</span>
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
	font-size: 1.4em;
	line-height: 1.2;
	flex-shrink: 0;
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

/* ai-assisted — warm amber */
.ai-usage--ai-assisted {
	background: #fdf4e3;
	border-color: #b07320;
	color: #6b450e;
}

/* ai-generated — burnt sienna (matches site accent) */
.ai-usage--ai-generated {
	background: #faf0e8;
	border-color: #9c5a34;
	color: #6f3d20;
}
</style>
