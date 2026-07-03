<script setup lang="ts">
import { socialLinks } from '../../lib/social';
</script>

<template>
	<span class="social-links">
		<template v-for="(link, i) in socialLinks" :key="link.platform">
			<a :href="link.url" target="_blank" rel="me noopener">{{ link.label }}</a
			><template v-if="i < socialLinks.length - 2">, </template
			><template v-else-if="i === socialLinks.length - 2"> and </template>
		</template>
	</span>
</template>

<style scoped>
.social-links a {
	color: var(--accent);
	text-decoration: underline;
	text-decoration-color: var(--rule);
	text-underline-offset: 2px;
}
.social-links a:hover {
	text-decoration-color: var(--accent);
}
</style>
