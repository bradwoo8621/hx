import {reactive} from '@hx/data';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {type ReactNode, useRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {
	AbstractHxReactContext,
	allHierarchyContexts,
	allHxComponentContexts,
	closestBoundHxComponentContext,
	findBoundHxComponentContext,
	findBoundHierarchyContext,
	HxDialog,
	HxHierarchyProvider,
	HxPanel,
	type HxHierarchyContext,
	type HxReactContext,
	useHxContext,
	useHxHierarchy,
	useHxHierarchyBound
} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

class TestContext extends AbstractHxReactContext {
	public readonly marker: string;

	public constructor(marker: string) {
		super();
		this.marker = marker;
	}
}

interface PanelContextLike extends HxReactContext {
	checkCollapsed(callback: (collapsed: boolean) => void): void;
	onCollapse(listener: () => void): void;
	offCollapse(listener: () => void): void;
}

const HierarchyProbe = (props: {onHierarchy: (hierarchy: HxHierarchyContext | undefined) => void}) => {
	const hierarchy = useHxHierarchy();
	return <button onClick={() => props.onHierarchy(hierarchy)}>probe</button>;
};

const BoundDiv = (props: {marker?: string, children?: ReactNode}) => {
	const ref = useRef<HTMLDivElement>(null);
	useHxHierarchyBound(ref);
	return <div data-hx-bound={props.marker ?? ''} ref={ref}>{props.children}</div>;
};

const OpenButton = (props: {id: string}) => {
	const context = useHxContext();
	return <button onClick={() => context.overlay.show(props.id, reactive({}) as never)}>open</button>;
};

const PanelContextProbe = (props: {onFound: (context: PanelContextLike | undefined) => void}) => {
	const context = useHxContext();
	return <button onClick={() => props.onFound(context.hierarchy?.closest<PanelContextLike>('HxPanelContext'))}>found</button>;
};

describe('HxHierarchy', () => {
	it('returns the delegated component context on self and ancestor matches', () => {
		const outer = new TestContext('outer');
		const inner = new TestContext('inner');
		let hierarchy: HxHierarchyContext | undefined;
		render(
			<HxHierarchyProvider context={outer} contextDisplayName="outer-context">
				<HxHierarchyProvider context={inner} contextDisplayName="inner-context">
					<HierarchyProbe onHierarchy={h => hierarchy = h}/>
				</HxHierarchyProvider>
			</HxHierarchyProvider>
		);
		fireEvent.click(screen.getByRole('button'));

		expect(hierarchy).toBeTruthy();
		expect(hierarchy!.name()).toBe('inner-context');
		expect(hierarchy!.current<TestContext>()).toBe(inner);
		// self match returns the delegated context, not the hierarchy wrapper
		expect(hierarchy!.closest<TestContext>('inner-context')).toBe(inner);
		// ancestor match returns the delegated context with its full API
		expect(hierarchy!.closest<TestContext>('outer-context')).toBe(outer);
		// unknown names return undefined
		expect(hierarchy!.closest('unknown-context')).toBeUndefined();
		// includeMyself=false skips the wrapper itself
		expect(hierarchy!.closest<TestContext>('inner-context', false)).toBeUndefined();
		expect(hierarchy!.closest<TestContext>('outer-context', false)).toBe(outer);
		// ancestors: nearest first, excluding the wrapper itself
		expect(hierarchy!.ancestors()).toEqual([outer]);
	});

	it('binds and unbinds the handle on the element', () => {
		const testContext = new TestContext('ctx');
		const {container, unmount} = render(
			<HxHierarchyProvider context={testContext} contextDisplayName="test-context">
				<BoundDiv/>
			</HxHierarchyProvider>
		);
		const el = queryByDataAttr(container, 'data-hx-bound')!;
		expect(el.getAttribute('data-hx-hierarchy-context')).toBe('test-context');
		expect(findBoundHierarchyContext(el)).toBeTruthy();
		expect(findBoundHxComponentContext<TestContext>(el)).toBe(testContext);

		unmount();
		expect(el.hasAttribute('data-hx-hierarchy-context')).toBe(false);
		expect(findBoundHierarchyContext(el)).toBeUndefined();
	});

	it('does nothing when there is no hierarchy provider above', () => {
		const {container} = render(<BoundDiv/>);
		const el = queryByDataAttr(container, 'data-hx-bound')!;
		expect(el.hasAttribute('data-hx-hierarchy-context')).toBe(false);
		expect(findBoundHierarchyContext(el)).toBeUndefined();
	});

	it('collects nested bound ancestors innermost first', () => {
		const outer = new TestContext('outer');
		const inner = new TestContext('inner');
		const {container} = render(
			<HxHierarchyProvider context={outer} contextDisplayName="outer-context">
				<BoundDiv marker="outer">
					<HxHierarchyProvider context={inner} contextDisplayName="inner-context">
						<BoundDiv marker="inner">
							<div data-hx-target=""/>
						</BoundDiv>
					</HxHierarchyProvider>
				</BoundDiv>
			</HxHierarchyProvider>
		);
		const target = queryByDataAttr(container, 'data-hx-target')!;

		const hierarchies = allHierarchyContexts(target);
		expect(hierarchies).toHaveLength(2);
		expect(hierarchies[0]!.name()).toBe('inner-context');
		expect(hierarchies[1]!.name()).toBe('outer-context');

		const contexts = allHxComponentContexts(target) as Array<TestContext>;
		expect(contexts).toEqual([inner, outer]);

		// one-step DOM lookup by registered name
		expect(closestBoundHxComponentContext<TestContext>(target, 'inner-context')).toBe(inner);
		expect(closestBoundHxComponentContext<TestContext>(target, 'outer-context')).toBe(outer);
		expect(closestBoundHxComponentContext<TestContext>(target, 'unknown-context')).toBeUndefined();

		// starting from the bound inner root itself: self is included, outer is still found
		const innerRoot = container.querySelector<HTMLElement>('[data-hx-bound="inner"]')!;
		expect(allHierarchyContexts(innerRoot).map(h => h.name()))
			.toEqual(['inner-context', 'outer-context']);

		// an unbound element collects nothing
		const outerRoot = container.querySelector<HTMLElement>('[data-hx-bound="outer"]')!;
		expect(allHierarchyContexts(outerRoot.parentElement)).toEqual([]);
	});
});

describe('HxHierarchy integration', () => {
	it('reaches the governing panel contexts from a nested field element', () => {
		const collapseSpy = vi.fn();
		const {container} = renderWithProvider(
			<HxPanel title="outer" collapsible>
				<HxPanel title="inner" collapsible>
					<div data-hx-target=""/>
				</HxPanel>
			</HxPanel>
		);
		const target = queryByDataAttr(container, 'data-hx-target')!;
		const contexts = allHxComponentContexts(target) as Array<PanelContextLike>;
		expect(contexts).toHaveLength(2);

		// document order: the outer header renders before the inner one
		const buttons = container.querySelectorAll('[data-hx-panel-collapse-button]');
		expect(buttons).toHaveLength(2);

		// closest by name resolves to the inner panel: the inner button fires its listener
		// (had it resolved to the outer context, the click below would fire nothing)
		const innerPanel = closestBoundHxComponentContext<PanelContextLike>(target, 'HxPanelContext')!;
		innerPanel.onCollapse(collapseSpy);
		fireEvent.click(buttons[1]!);
		expect(collapseSpy).toHaveBeenCalledTimes(1);

		// the outer panel is the second collected context and drives the outer button
		const outerPanel = contexts[1]!;
		outerPanel.onCollapse(collapseSpy);
		fireEvent.click(buttons[0]!);
		expect(collapseSpy).toHaveBeenCalledTimes(2);
	});

	it('reaches the declaration-site panel context from inside the overlay portal', async () => {
		const found: Array<PanelContextLike> = [];
		renderWithProvider(
			<HxPanel title="host">
				<OpenButton id="dlg"/>
				<HxDialog id="dlg">
					<PanelContextProbe onFound={c => found.push(c!)}/>
				</HxDialog>
			</HxPanel>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).not.toBeNull());
		fireEvent.click(screen.getByText('found'));

		// the React chain of the overlay instance reaches the panel that declares the template
		expect(found).toHaveLength(1);
		expect(typeof found[0]!.checkCollapsed).toBe('function');
		let collapsed = true;
		found[0]!.checkCollapsed(value => collapsed = value);
		expect(collapsed).toBe(false);

		// the DOM chain only reaches the bound portal root: the instance context, not the panel
		const overlayEl = document.querySelector<HTMLElement>('[data-hx-overlay]')!;
		const names = allHierarchyContexts(overlayEl).map(h => h.name());
		expect(names[0]).toBe('HxOverlayInstanceContext');
		expect(names).not.toContain('HxPanelContext');
	});
});
