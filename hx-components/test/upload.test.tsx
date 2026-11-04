import {reactive} from '@hx/data';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HxUpload, type HxObject, type HxUploadProps, type HxUploadingFile} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

type UploadModel = {files?: Array<{name: string, size?: number, mimeType?: string}>};

const makeFile = (name: string, content = 'x'): File => {
	return new File([content], name, {type: 'text/plain'});
};

const uploadOne = async (files: Array<File>): Promise<Array<HxUploadingFile>> => {
	return files.map(file => ({
		details: {name: file.name, size: file.size, mimeType: file.type},
		upload: async () => ({name: file.name, size: file.size})
	}));
};

const noopDownload = async () => (void 0);

const renderUpload = (
	model: HxObject<UploadModel>,
	props: Partial<HxUploadProps<UploadModel>> = {}
) => {
	return renderWithProvider(
		<HxUpload $model={model} $field="files"
		          upload={uploadOne}
		          download={noopDownload}
		          {...props}/>
	);
};

describe('HxUpload', () => {
	it('renders the button variant with its trigger and file input', () => {
		const model = reactive<UploadModel>({});
		const {container} = renderUpload(model);
		const root = queryByDataAttr(container, 'data-hx-upload')!;
		expect(root.getAttribute('data-hx-upload-variant')).toBe('button');
		expect(screen.getByText('HxCommon.ButtonUpload')).toBeTruthy();
		const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
		expect(input).not.toBeNull();
		expect(input.multiple).toBe(true);
	});

	it('renders the dnd and gallery variants', () => {
		const model = reactive<UploadModel>({});
		const dnd = renderUpload(model, {variant: 'dnd'});
		expect(queryByDataAttr(dnd.container, 'data-hx-upload')!.getAttribute('data-hx-upload-variant')).toBe('dnd');
		expect(queryByDataAttr(dnd.container, 'data-hx-upload-trigger')).not.toBeNull();

		const gallery = renderUpload(model, {variant: 'gallery', accept: 'image/*'});
		expect(queryByDataAttr(gallery.container, 'data-hx-upload')!.getAttribute('data-hx-upload-variant')).toBe('gallery');
		expect(gallery.container.querySelector('[data-hx-upload-trigger="gallery"]')).not.toBeNull();
	});

	it('renders the existing files from the model and deletes one', async () => {
		const model = reactive<UploadModel>({files: [{name: 'a.txt'}, {name: 'b.txt'}]});
		const {container} = renderUpload(model);
		await waitFor(() => expect(container.querySelectorAll('[data-hx-upload-file]')).toHaveLength(2));
		expect(container.textContent).toContain('a.txt');

		fireEvent.click(container.querySelectorAll('[data-hx-upload-file-delete]')[0]);
		expect(model.files).toHaveLength(1);
		expect(model.files![0].name).toBe('b.txt');
	});

	it('uploads a selected file and writes it into the model', async () => {
		const model = reactive<UploadModel>({files: []});
		const {container} = renderUpload(model);
		const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

		fireEvent.change(input, {target: {files: [makeFile('new.txt')]}});
		await waitFor(() => expect(model.files).toHaveLength(1));
		expect(model.files![0].name).toBe('new.txt');
	});

	it('reports the over max count error and keeps the model unchanged', async () => {
		const model = reactive<UploadModel>({files: [{name: 'existing.txt'}]});
		const {container} = renderUpload(model, {maxFileCount: 2});
		const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

		fireEvent.change(input, {target: {files: [makeFile('a.txt'), makeFile('b.txt')]}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-upload-error-msg')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-upload-error-msg')!.textContent)
			.toContain('HxCommon.UploadOverMaxCount');
		expect(model.files).toHaveLength(1);
	});

	it('reports an over max size error for the selected file', async () => {
		const model = reactive<UploadModel>({files: []});
		const {container} = renderUpload(model, {maxFileSize: 2});
		const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

		fireEvent.change(input, {target: {files: [makeFile('big.txt', '0123456789')]}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-upload-file-error-msg')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-upload-file-error-msg')!.textContent)
			.toContain('HxCommon.UploadOverMaxSize');
		expect(model.files).toHaveLength(0);
	});

	it('shows a per-file error returned by the upload function', async () => {
		const model = reactive<UploadModel>({files: []});
		const failingUpload = async (files: Array<File>): Promise<Array<HxUploadingFile>> => {
			return files.map(file => ({
				details: {name: file.name, size: file.size},
				upload: async () => 'not-acceptable'
			}));
		};
		const {container} = renderUpload(model, {upload: failingUpload});
		const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
		fireEvent.change(input, {target: {files: [makeFile('bad.txt')]}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-upload-file-error-msg')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-upload-file-error-msg')!.textContent)
			.toContain('HxCommon.UploadNotAcceptable');
		expect(model.files).toHaveLength(0);
	});

	it('uses the read transform to display files', () => {
		const model = reactive<UploadModel>({});
		const {container} = renderUpload(model, {
			read: () => [{name: 'virtual.txt'}]
		});
		expect(container.textContent).toContain('virtual.txt');
	});

	it('uses the write transform when a file is deleted', async () => {
		const model = reactive<UploadModel>({files: [{name: 'a.txt'}]});
		const write = vi.fn();
		const {container} = renderUpload(model, {write});
		fireEvent.click(container.querySelector('[data-hx-upload-file-delete]')!);
		expect(write).toHaveBeenCalledTimes(1);
		expect(write.mock.calls[0][2]).toEqual([]);
	});

	it('disables the file input and trigger', () => {
		const model = reactive<UploadModel>({});
		const {container} = renderUpload(model, {$disabled: true});
		expect(container.querySelector<HTMLInputElement>('input[type="file"]')!.disabled).toBe(true);
		expect(screen.getByRole('button', {name: /HxCommon.ButtonUpload/}).hasAttribute('disabled')).toBe(true);
	});

	it('marks the hidden state through $visible', () => {
		const model = reactive<UploadModel>({});
		const {container} = renderUpload(model, {$visible: false});
		expect(queryByDataAttr(container, 'data-hx-upload')!.getAttribute('data-hx-visible')).toBe('no');
	});

	it('forwards ref to the root element', () => {
		const model = reactive<UploadModel>({});
		const ref = {current: null as HTMLDivElement | null};
		renderWithProvider(
			<HxUpload $model={model} $field="files" upload={uploadOne} download={noopDownload} ref={ref}/>
		);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-upload')).toBe(true);
	});
});
