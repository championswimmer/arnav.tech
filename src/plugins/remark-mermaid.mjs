import { visit } from 'unist-util-visit';

/**
 * Converts fenced ```mermaid code blocks into raw HTML `<pre class="mermaid">`
 * nodes *before* syntax highlighting runs, so Shiki leaves them alone and the
 * client-side mermaid runtime can render them.
 *
 * Pairs with the client script in `src/components/Mermaid.astro`.
 */
export function remarkMermaid() {
	return (tree) => {
		visit(tree, 'code', (node, index, parent) => {
			if (node.lang !== 'mermaid' || !parent || index === null) return;

			const definition = node.value
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');

			parent.children[index] = {
				type: 'html',
				value: `<pre class="mermaid" data-mermaid>${definition}</pre>`,
			};
		});
	};
}

export default remarkMermaid;
