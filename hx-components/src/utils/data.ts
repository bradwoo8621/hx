import {ERO, type ModelPath} from '@hx/data';
import type {HxDataPath, HxObject} from '../types';

export class HxDataUtils {
	static resolveChildModel<T extends object>($model?: HxObject<T>, $field?: ModelPath<T> | HxDataPath) {
		// Resolve the model to pass to child components
		let $modelToChild = $model;
		if ($model != null && $field != null && $field.length !== 0) {
			// If $field is specified, extract the nested reactive object from the parent model
			$modelToChild = ERO.getValue($model, $field);
			if ($modelToChild == null) {
				// Materialize an object, not an array: a child model is object-backed by contract
				// (HxObject rejects arrays), and a numeric index arrives as a string, so an array
				// target cannot be inferred here. Array-valued fields must be initialized upstream.
				// Silent because this runs during render and must not emit change events.
				ERO.setValueSilent($model, $field, {}, 'mute-all');
				$modelToChild = ERO.getValue($model, $field);
			}
		}
		return $modelToChild;
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}
