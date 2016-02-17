import { mountNode } from './mounting';
import { isStatefulComponent, isArray, isNullOrUndefined } from '../core/utils';
import { recyclingEnabled, pool } from './recycling';

export const MathNamespace = 'http://www.w3.org/1998/Math/MathML';
export const SVGNamespace = 'http://www.w3.org/2000/svg';

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (nextNode) {
		parentDom.insertBefore(newNode, nextNode);
	} else {
		parentDom.appendChild(newNode);
	}
}

export function createElement(tag, namespace) {
	if (namespace) {
		return document.createElementNS(namespace, tag);
	} else {
		return document.createElement(tag);
	}
}

export function appendText(text, parentDom, singleChild) {
	if (singleChild) {
		if (text !== '') {
			parentDom.textContent = text;
		} else {
			parentDom.appendChild(document.createTextNode(''));
		}
	} else {
		const textNode = document.createTextNode(text);

		parentDom.appendChild(textNode);
	}
}

export function replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context) {
	const dom = mountNode(nextNode, null, namespace, lifecycle, context);
	parentDom.replaceChild(dom, lastNode.dom);
	nextNode.dom = dom;
}

export function detachNode(node) {
	if (isNullOrUndefined(node)) {
		return;
	}
	if (isStatefulComponent(node.instance)) {
		node.instance.componentWillUnmount();
		node.instance._unmounted = true;
	}
	if (node.events && node.events.willDetach) {
		node.events.willDetach(node.dom);
	}
	if (node.events && node.events.componentWillUnmount) {
		node.events.componentWillUnmount(node.dom, node.events);
	}
	const children = node.children;

	if (children) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				detachNode(children[i]);
			}
		} else {
			detachNode(children);
		}
	}
}

export function remove(node, parentDom) {
	const dom = node.dom;

	detachNode(node);
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
		}
	}
}