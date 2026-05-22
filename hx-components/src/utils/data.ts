import {ERO, type ModelPath} from '@hx/data';
import type {HxDataPath, HxObject} from '../types';

export class HxDataUtils {
	static resolveChildModel<T extends object>($model?: HxObject<T>, $field?: ModelPath<T> | HxDataPath) {
		// Resolve the model to pass to child components
		let $modelToChild = $model;
		if ($model != null && $field != null && $field.length !== 0) {
			// If $field is specified, extract the nested reactive object from the parent model
			$modelToChild = ERO.getValue($model, $field);
		}
		return $modelToChild;
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}
