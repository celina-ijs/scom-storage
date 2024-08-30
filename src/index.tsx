import {
    Module,
    Styles,
    FormatUtils,
    Table,
    Control,
    TreeNode,
    TreeView,
    customElements,
    ControlElement,
    IDataSchema,
    Panel,
    IPFS,
    Button,
    TableColumn,
    Label,
    Modal,
    VStack,
    Container,
    moment,
    Icon
} from '@ijstech/components';
import { IPreview, IIPFSData, IStorageConfig, ITableData } from './interface';
import { formatBytes } from './data';
import { ScomIPFSMobileHome, ScomIPFSPath, ScomIPFSUploadModal, ScomIPFSPreview, LoadingSpinner, ScomIPFSEditor } from './components/index';
import { Editor, IFileHandler } from './file';
import customStyles, { defaultColors, dragAreaStyle, iconButtonStyled, previewModalStyle, selectedRowStyle } from './index.css';
import { isFileExists } from './utils';

export { IFileHandler, IIPFSData };

const Theme = Styles.Theme.ThemeVars;

type selectFileCallback = (path: string) => void;
type cancelCallback = () => void;

interface ScomStorageElement extends ControlElement {
    transportEndpoint?: string;
    signer?: IPFS.ISigner;
    baseUrl?: string;
    isModal?: boolean;
    isUploadModal?: boolean;
    uploadMultiple?: boolean;
    isFileShown?: boolean;
    onOpen?: selectFileCallback;
    onCancel?: cancelCallback;
    onPreview?: () => void;
    onClosePreview?: () => void;
    onUploadedFile?: selectFileCallback;
}

interface UploadRawFile extends File {
    uid?: number;
    path?: string;
    cid?: {
        cid: string;
        size: number;
    };
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-storage']: ScomStorageElement;
        }
    }
}

@customElements('i-scom-storage')
export class ScomStorage extends Module {
    private iconBack: Icon;
    private pnlUpload: Panel;
    private pnlStorage: Panel;
    private pnlPath: ScomIPFSPath;
    private uploadedFileTree: TreeView;
    private mobileHome: ScomIPFSMobileHome;
    private iePreview: ScomIPFSPreview;
    private pnlPreview: Panel;
    private uploadModal: ScomIPFSUploadModal;
    private ieContent: Panel;
    private ieSidebar: Panel;
    private btnUpload: Button;
    private currentItem: TreeNode;
    private mdActions: Modal;
    private pnlLoading: VStack;
    private loadingSpinner: LoadingSpinner;
    private pnlFooter: Panel;
    private pnlCustom: Panel;
    private btnBack: Button;

    private fileEditors: Map<string | RegExp, IFileHandler> = new Map();
    private currentEditor: IFileHandler | null = null;

    private static instance: ScomStorage;
    public static getInstance() {
        if (!ScomStorage.instance) {
            ScomStorage.instance = new ScomStorage();
        }
        return ScomStorage.instance;
    }

    tag: any = {
        light: {},
        dark: {}
    }
    private _data: IStorageConfig = {};
    private pnlFileTable: Panel;
    private pnlUploadTo: Panel;
    private lblDestinationFolder: Label;
    private fileTable: Table;
    private filesColumns = [
        {
            title: '',
            fieldName: 'checkbox'
        },
        {
            title: 'Name',
            fieldName: 'name',
            onRenderCell: (source: Control, columnData: any, rowData: any) => {
                switch (rowData.type) {
                    case 'dir':
                        return (
                            <i-hstack verticalAlignment="center" gap="0.375rem">
                                <i-panel stack={{ basis: '1rem' }}>
                                    <i-icon name="folder" width={'0.875rem'} height={'0.875rem'} display="inline-flex" fill="#fddd35"></i-icon>
                                </i-panel>
                                <i-label caption={columnData} font={{ size: '0.875rem' }}></i-label>
                            </i-hstack>
                        );
                    case 'file':
                        return (
                            <i-hstack verticalAlignment="center" gap="0.375rem">
                                <i-panel stack={{ basis: '1rem' }}>
                                    <i-icon name="file" width={'0.875rem'} height={'0.875rem'} display="inline-flex" fill="#298de0"></i-icon>
                                </i-panel>
                                <i-label caption={columnData} font={{ size: '0.875rem' }}></i-label>
                            </i-hstack>
                        );
                    default:
                        return columnData;
                }
            },
        },
        {
            title: 'Type',
            fieldName: 'type',
            onRenderCell: (source: Control, columnData: any, rowData: any) => {
                switch (rowData.type) {
                    case 'dir':
                        return 'File folder';
                    case 'file':
                        return 'File';
                    default:
                        return columnData;
                }
            },
        },
        {
            title: 'Size',
            fieldName: 'size',
            onRenderCell: (source: Control, columnData: any, rowData: any) => {
                return formatBytes(columnData);
            },
        },
        {
            title: '',
            fieldName: 'blank',
        },
    ];
    private columns: any[] = this.filesColumns.slice();
    private _uploadedTreeData: any = [];
    private _uploadedFileNodes: { [idx: string]: TreeNode } = {};
    private currentCid: string;
    private rootCid: string;
    private _baseUrl: string;
    private selectedRow: HTMLElement;
    private manager: IPFS.FileManager;
    private counter: number = 0;
    private _readOnly = false;
    private isInitializing = false;
    private _isModal: boolean = false;
    private _isUploadModal: boolean = false;
    private isUploadMultiple: boolean = true;
    private _isFileShown: boolean = false;
    private currentFile: string;
    private _signer: IPFS.ISigner;
    private isAssetRootNode = false;

    onOpen: selectFileCallback;
    onCancel: cancelCallback;
    onPreview: () => void;
    onClosePreview: () => void;
    onUploadedFile: selectFileCallback;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        this.onCellDblClick = this.onCellDblClick.bind(this);
        this.registerDefaultEditors();
    };

    get baseUrl(): string {
        return this._baseUrl;
    }

    set baseUrl(url: string) {
        this._baseUrl = url;
    }

    private get readOnly(): boolean {
        return this._readOnly;
    };
    private set readOnly(value: boolean) {
        this._readOnly = value;
        this.btnUpload.visible = this.btnUpload.enabled = this.isUploadModal ? false : !value;
        if (this.ieSidebar) {
            this.ieSidebar.minWidth = this.readOnly ? '15rem' : '10rem';
        }
    }

    get isModal(): boolean {
        return this._isModal;
    };
    set isModal(value: boolean) {
        this._isModal = value;
    }

    get isUploadModal(): boolean {
        return this._isUploadModal;
    }
    set isUploadModal(value: boolean) {
        this._isUploadModal = value;
        if (this.pnlStorage) this.pnlStorage.visible = false;
    }

    get uploadMultiple(): boolean {
        return this.isUploadMultiple;
    }
    set uploadMultiple(value: boolean) {
        this.isUploadMultiple = value;
        if (this.uploadModal) this.uploadModal.mulitiple = value;
    }

    get transportEndpoint() {
        return this._data.transportEndpoint;
    }
    set transportEndpoint(value) {
        this._data.transportEndpoint = value;
    }

    get signer() {
        return this._signer;
    }
    set signer(value) {
        this._signer = value;
    }

    get isFileShown() {
        return this._isFileShown ?? false;
    }
    set isFileShown(value: boolean) {
        this._isFileShown = value ?? false;
    }

    setConfig(config: IStorageConfig) {
        this._data = config;
        this._signer = config.signer;
        this.manager = new IPFS.FileManager({
            endpoint: this._data.transportEndpoint,
            signer: this._signer
        });
    }

    getConfig() {
        return this._data;
    }

    private registerDefaultEditors(): void {
        const editor = new ScomIPFSEditor()
        this.registerEditor("md", editor);
        this.registerEditor("tsx", editor);
        this.registerEditor(/(yml|yaml|json|js|s?css|ts)/i, new Editor());
        this.registerEditor(/(mp4|webm|mov|m3u8|jpeg|jpg|png|gif|bmp|svg)$/i, new ScomIPFSPreview());
    }

    registerEditor(fileType: string | RegExp, editor: IFileHandler): void {
        this.fileEditors.set(fileType, editor);
    }

    async openFile(ipfsData: IIPFSData) {
        if (!ipfsData) return;
        this.pnlPreview.visible = false;
        if (ipfsData.type === 'dir') {
            this.pnlCustom.visible = false;
            this.ieContent.visible = true;
            await this.onOpenFolder(ipfsData, true);
        } else {
            this.pnlCustom.visible = true;
            this.ieContent.visible = false;
            this.pnlCustom.clearInnerHTML();
            if (this.currentEditor && this.currentEditor instanceof ScomIPFSEditor) {
                this.currentEditor.onHide();
            }
            const fileType = this.getFileType(ipfsData.name); // ipfsData.name.includes('scconfig.json') ? 'scconfig.json' : this.getFileType(ipfsData.name);
            const config = this.getFileConfig(ipfsData);
            if (this.fileEditors.has(fileType)) {
                this.currentEditor = this.fileEditors.get(fileType);
                this.currentEditor && this.currentEditor.openFile(ipfsData, this.rootCid, this.pnlCustom, config);
            } else {
                const fileTypes = Array.from(this.fileEditors);
                if (fileTypes?.length) {
                    for (const type of fileTypes) {
                        const key: string | RegExp = type[0];
                        if (typeof key === 'string') continue;
                        if (key.test(fileType)) {
                            if (type[1]) {
                                this.currentEditor = type[1];
                                this.currentEditor.openFile(ipfsData, this.rootCid, this.pnlCustom, config);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    private getFileConfig(ipfsData: IIPFSData) {
        let parentCid = this.rootCid;
        const parentPath = ipfsData.path.split('/').slice(0, -1).join('/');
        const parentData = this._uploadedTreeData.find((item: any) => item.path === parentPath);
        if (parentData?.cid) parentCid = parentData.cid;
        return {
            transportEndpoint: this.transportEndpoint,
            signer: this.signer,
            baseUrl: this.baseUrl,
            cid: parentCid
        }
    }

    private getFileType(name: string) {
        return (name || '').split('.').pop().toLowerCase();
    }

    private async setData(value: IStorageConfig) {
        this._data = value;
        if (this.transportEndpoint) {
            this.mobileHome.transportEndpoint = this.transportEndpoint;
        }
    }

    private getData() {
        return this._data;
    }

    async onShow() {
        this.manager.reset();
        try {
            await this.manager.setRootCid('');
        } catch (err) { }
        this.pnlPreview.visible = false;
        this.btnUpload.right = '3.125rem';
        await this.initContent();
    }

    getConfigurators() {
        return [
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: () => {
                    return this._getActions();
                },
                getData: this.getData.bind(this),
                setData: this.setData.bind(this),
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            }
        ]
    }

    private getPropertiesSchema() {
        const schema: IDataSchema = {
            type: "object",
            required: ["cid"],
            properties: {
                cid: {
                    type: "string"
                }
            }
        };
        return schema;
    }

    private _getActions() {
        const propertiesSchema = this.getPropertiesSchema();
        const actions = [
            {
                name: 'Edit',
                icon: 'edit',
                command: (builder: any, userInputData: any) => {
                    let oldData = {};
                    return {
                        execute: () => {
                            oldData = { ...this._data };
                            if (userInputData?.transportEndpoint) this._data.transportEndpoint = userInputData.transportEndpoint;
                            this.initContent();
                            if (builder?.setData) builder.setData(this._data);
                        },
                        undo: () => {
                            this._data = { ...oldData };
                            this.initContent();
                            if (builder?.setData) builder.setData(this._data);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: propertiesSchema as IDataSchema
            }
        ]
        return actions
    }

    private getTag() {
        return this.tag;
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private async setTag(value: any) {
        const newValue = value || {};
        for (let prop in newValue) {
            if (newValue.hasOwnProperty(prop)) {
                if (prop === 'light' || prop === 'dark')
                    this.updateTag(prop, newValue[prop]);
                else
                    this.tag[prop] = newValue[prop];
            }
        }
        this.updateTheme();
    }

    private updateStyle(name: string, value: any) {
        value ?
            this.style.setProperty(name, value) :
            this.style.removeProperty(name);
    }

    private updateTheme() {
        const themeVar = document.body.style.getPropertyValue('--theme') || 'dark';
        this.updateStyle('--text-primary', this.tag[themeVar]?.fontColor);
        this.updateStyle('--text-secondary', this.tag[themeVar]?.secondaryColor);
        this.updateStyle('--background-main', this.tag[themeVar]?.backgroundColor);
        this.updateStyle('--colors-primary-main', this.tag[themeVar]?.primaryColor);
        this.updateStyle('--colors-primary-light', this.tag[themeVar]?.primaryLightColor);
        this.updateStyle('--colors-primary-dark', this.tag[themeVar]?.primaryDarkColor);
        this.updateStyle('--colors-secondary-light', this.tag[themeVar]?.secondaryLight);
        this.updateStyle('--colors-secondary-main', this.tag[themeVar]?.secondaryMain);
        this.updateStyle('--divider', this.tag[themeVar]?.borderColor);
        this.updateStyle('--action-selected', this.tag[themeVar]?.selected);
        this.updateStyle('--action-selected_background', this.tag[themeVar]?.selectedBackground);
        this.updateStyle('--action-hover_background', this.tag[themeVar]?.hoverBackground);
        this.updateStyle('--action-hover', this.tag[themeVar]?.hover);
    }

    private async getAssetRootNode() {
        let rootNode: IPFS.FileNode;
        try {
            rootNode = await this.manager.getRootNode();
            let node = await rootNode.findItem('_assets');
            if (node) {
                await node.checkCid();
                const cidInfo = node.cidInfo as IIPFSData;
                cidInfo.name = '_assets';
                cidInfo.path = '/_assets';
                rootNode = node;
            }
            this.isAssetRootNode = !!node;
        } catch (err) {
            console.log(err);
        }
        return rootNode;
    }

    private updateUrlPath(path?: string) {
        if (this.isModal || this.isUploadModal) return;
        let baseUrl = this.baseUrl ? this.baseUrl + (this.baseUrl[this.baseUrl.length - 1] == '/' ? '' : '/') : '#/';
        let url = baseUrl;
        if (this.rootCid) url += this.rootCid;
        if (path) {
            if (path.startsWith('/_assets')) path = path.slice(8);
            url += path;
        }
        history.replaceState({}, "", url);
    }

    private extractUrl() {
        let path: string;
        if (this.baseUrl && window.location.hash.startsWith(this.baseUrl)) {
            let length = this.baseUrl[this.baseUrl.length - 1] == '/' ? this.baseUrl.length : this.baseUrl.length + 1;
            path = window.location.hash.substring(length);
        } else {
            path = window.location.hash.substring(2);
        }
        let arr = path?.split('/');
        const [cid, ...paths] = arr;
        return { cid, path: paths.length ? '/' + paths.join('/') : '' };
    }

    private async initContent() {
        this.pnlFooter.visible = this.isModal;
        this.btnBack.visible = this.isUploadModal || false;
        this.pnlStorage.visible = !this.isUploadModal;
        this.iconBack.visible = false;
        if (this.pnlUpload) this.pnlUpload.visible = this.isUploadModal || false;
        if (!this.manager || this.isInitializing) return;
        this.isInitializing = true;
        const { cid, path } = this.extractUrl();
        let rootNode = await this.getAssetRootNode();
        if (this.isUploadModal) {
            this.uploadModal.reset();
            if (window.matchMedia('(max-width: 767px)').matches) {
                this.uploadModal.manager = this.mobileHome.manager;
            } else {
                this.uploadModal.manager = this.manager;
            }
            this.uploadModal.show(this.isAssetRootNode ? `/_assets/uploads_${moment(new Date()).format('YYYYMMDD')}` : '');
        }
        this.rootCid = this.currentCid = rootNode?.cid;
        this.readOnly = !this.rootCid || (!this.isModal && !this.isUploadModal && (cid && cid !== this.rootCid));
        if (!this.isModal && !this.isUploadModal) {
            if (this.readOnly && cid) {
                rootNode = await this.manager.setRootCid(cid);
                if (rootNode) this.rootCid = cid;
            } else if (!cid) {
                this.updateUrlPath();
            }
        }
        const ipfsData = rootNode?.cidInfo as IIPFSData;
        if (ipfsData) {
            this.renderUI(ipfsData, this.isAssetRootNode && !this.readOnly ? '/_assets' + path : path);
        }
        this.isInitializing = false;
    }

    private async constructLinks(ipfsData: IIPFSData, links: IIPFSData[]) {
        return await Promise.all(
            links.map(async (data) => {
                data.path = `${ipfsData.path}/${data.name}`;
                if (!data.type) {
                    let node = await this.manager.getFileNode(data.path);
                    let isFolder = await node.isFolder();
                    data.type = isFolder ? 'dir' : 'file'
                }
                return data;
            })
        );
    }

    private async renderUI(ipfsData: IIPFSData, path?: string) {
        if (!ipfsData) return;
        const parentNode = (({ links, ...o }) => o)(ipfsData) as IIPFSData;
        parentNode.name = parentNode.name ? parentNode.name : FormatUtils.truncateWalletAddress(parentNode.cid);
        parentNode.path = parentNode.path || '';
        parentNode.root = true;
        if (ipfsData.links?.length) {
            ipfsData.links = await this.constructLinks(parentNode, ipfsData.links);
        }
        let data = ipfsData.links ? [parentNode, ...ipfsData.links] : [parentNode];
        let tableData = ipfsData;
        this.pnlPath.clear();
        if (parentNode.name) this.pnlPath.setData(parentNode);
        if (path && !this.isModal && !this.isUploadModal) {
            let items = path.split('/');
            for (let i = 1; i < items.length; i++) {
                if (!items[i]) continue;
                let filePath = items.slice(0, i + 1).join('/');
                let fileNode = await this.manager.getFileNode(filePath);
                let isFolder = await fileNode.isFolder();
                if (isFolder) {
                    const cidInfo = fileNode.cidInfo as IIPFSData;
                    cidInfo.path = filePath;
                    if (!cidInfo.name) cidInfo.name = fileNode.name || items[i];
                    cidInfo.links = await this.constructLinks(cidInfo, cidInfo.links);
                    this.currentCid = cidInfo.cid;
                    data.push(...cidInfo.links);
                    tableData = { ...cidInfo };
                    let pathData = (({ links, ...o }) => o)(tableData);
                    pathData.name = pathData.name ? pathData.name : pathData.cid;
                    pathData.path = `${cidInfo.path}`;
                    this.pnlPath.setData(pathData);
                    if (i === items.length - 2) {
                        let record = cidInfo.links.find(link => link.type === 'file' && link.name === items[i + 1]);
                        if (record) {
                            this.previewFile(record);
                            break;
                        }
                    }
                } else if (items.length === 2) {
                    let record = ipfsData.links.find(link => link.type === 'file' && link.name === items[i]);
                    if (record) {
                        this.previewFile(record);
                        break;
                    }
                }
            }
        }
        this._uploadedTreeData = [...data];
        this.renderUploadedFileTreeUI(true, path);
        this.fileTable.data = this.processTableData(tableData);
        this.mobileHome.setData({
            recents: [...ipfsData.links].filter(item => item.type === 'file'),
            folders: ipfsData.links ?? [],
            parentNode: parentNode
        });
    }

    async renderUploadedFileTreeUI(needReset = true, path?: string) {
        if (needReset) {
            this.uploadedFileTree.clear();
            this._uploadedFileNodes = {};
        }

        for (let nodeData of this._uploadedTreeData) {
            await this.addUploadedFileNode(nodeData, path);
        }
    }

    async addUploadedFileNode(nodeData: IIPFSData, path?: string) {
        const name = nodeData.name;
        let idx: string = '';
        let items = nodeData.path?.split('/') ?? [];
        if (this.isAssetRootNode && !this.readOnly) items.shift();
        let node: TreeNode | null = null;
        let self = this;

        for (let i = 0; i < items.length; i++) {
            if (items[i] != null) {
                idx = idx + '/' + items[i];
                if (!self._uploadedFileNodes[idx]) {
                    if (nodeData.type === 'dir') {
                        node = self.uploadedFileTree.add(node, name);
                        self._uploadedFileNodes[idx] = node;
                        node.tag = nodeData;
                        node.height = '2.125rem';
                        node.icon.margin = { left: '0.388rem' };
                        node.icon.name = 'chevron-circle-right';
                        node.icon.fill = Theme.colors.primary.light;
                        node.icon.visible = true;
                        node.icon.display = 'inline-flex';
                        const isActive = path ? nodeData.path === path : nodeData.root;
                        if (nodeData.path === path) node.active = true;
                        if (isActive || path?.startsWith(nodeData.path + "/")) node.expanded = true;
                    }
                    if (nodeData.type === 'file' && this.isFileShown) {
                        node = self.uploadedFileTree.add(node, name);
                        self._uploadedFileNodes[idx] = node;
                        node.tag = nodeData;
                        node.height = '2.125rem';
                        node.icon.margin = { left: '0.388rem' };
                        node.icon.name = 'file';
                        node.icon.fill = Theme.colors.primary.light;
                        node.icon.visible = true;
                        node.icon.display = 'inline-flex';
                        if (nodeData.path === path) node.active = true;
                    }
                } else {
                    node = self._uploadedFileNodes[idx];
                    if (node && node.tag && idx === `/${nodeData.path}`) node.tag.cid = nodeData.cid;
                }

                if (node && nodeData.root) node.expanded = true;
            }
        }
    }

    private async onUpdateContent({ data, toggle }: { data: IIPFSData; toggle: boolean }) {
        if (data) {
            const fileNodes = this._uploadedFileNodes;

            for (const [idx, node] of Object.entries(fileNodes)) {
                if (node.tag && data.path === node.tag.path) {
                    this.uploadedFileTree.activeItem = node;

                    const parentNode = (({ links, ...o }) => o)(data);
                    parentNode.name = parentNode.name ? parentNode.name : parentNode.cid;
                    parentNode.path = `${node.tag.path}`;

                    this.onUpdateBreadcumbs(parentNode);

                    data.links.map((child) => (child.path = `${parentNode.path}/${child.name}`));
                    const processedData = [...data.links];

                    for (let nodeData of processedData) {
                        await this.addUploadedFileNode(nodeData);
                    }

                    !!toggle ? (node.expanded = !node.expanded) : (node.expanded = true);
                    break;
                }
            }
        }
    }

    private onUpdateBreadcumbs(node: IIPFSData) {
        this.pnlPath.setData(node);
    }

    private async onFilesUploaded(newPath?: string) {
        const rootNode = await this.getAssetRootNode();
        const ipfsData = rootNode.cidInfo;

        let path: string;
        if (newPath || newPath === '') {
            path = this.isAssetRootNode && !this.readOnly ? '/_assets' + newPath : newPath;
        } else if (window.matchMedia('(max-width: 767px)').matches) {
            path = this.mobileHome.currentPath;
        } else {
            path = this.pnlPath.data.path;
        }
        if (ipfsData) {
            this.rootCid = this.currentCid = ipfsData.cid;
            this.renderUI(ipfsData, path);
            this.updateUrlPath(path);
            this.currentFile = null;
        }
    }

    private handleUploadButtonClick() {
        this.onOpenUploadModal();
    }

    private onOpenUploadModal(path?: string, files?: File[]) {
        if (this.readOnly || this.isUploadModal) return;
        if (!this.uploadModal) {
            this.uploadModal = new ScomIPFSUploadModal();
            this.uploadModal.onUploaded = () => this.onFilesUploaded();
        }
        const modal = this.uploadModal.openModal({
            width: 800,
            maxWidth: '100%',
            popupPlacement: 'center',
            showBackdrop: true,
            closeOnBackdropClick: false,
            closeIcon: { name: 'times', fill: Theme.text.primary, position: 'absolute', top: '1rem', right: '1rem', zIndex: 2 },
            zIndex: 1000,
            padding: {},
            maxHeight: '100vh',
            overflow: { y: 'auto' },
            onClose: () => this.uploadModal.reset(),
            mediaQueries: [
                {
                    maxWidth: '767px',
                    properties: {
                        height: '100vh',
                        maxHeight: '100vh'
                    }
                }
            ]
        });
        this.uploadModal.refresh = modal.refresh.bind(modal);
        if (window.matchMedia('(max-width: 767px)').matches) {
            if (path == null) path = this.mobileHome.currentPath;
            this.uploadModal.manager = this.mobileHome.manager;
        } else {
            if (path == null) path = this.pnlPath.data.path;
            this.uploadModal.manager = this.manager;
        }
        this.uploadModal.show(path, files);
        this.uploadModal.mulitiple = this.uploadMultiple;
        modal.refresh();
    }

    private async initModalActions() {
        this.mdActions = await Modal.create({
            visible: false,
            showBackdrop: false,
            minWidth: '8rem',
            height: 'auto',
            popupPlacement: 'bottomRight'
        });
        const itemActions = new VStack(undefined, { gap: 8, border: { radius: 8 } });
        itemActions.appendChild(<i-button background={{ color: 'transparent' }} boxShadow="none" icon={{ name: 'folder-plus', width: 12, height: 12 }} caption="New folder" class={iconButtonStyled} onClick={() => this.onAddNewFolder()} />);
        itemActions.appendChild(<i-button background={{ color: 'transparent' }} boxShadow="none" icon={{ name: 'edit', width: 12, height: 12 }} caption="Rename" class={iconButtonStyled} onClick={() => this.onRenameFolder()} />);
        itemActions.appendChild(<i-button background={{ color: 'transparent' }} boxShadow="none" icon={{ name: 'trash', width: 12, height: 12 }} caption="Delete" class={iconButtonStyled} onClick={() => this.onDeleteFolder()} />);
        this.mdActions.item = itemActions;
        document.body.appendChild(this.mdActions);
    }

    private async onActiveChange(parent: TreeView, prevNode?: TreeNode) {
        const ipfsData = parent.activeItem?.tag;
        if (!prevNode?.isSameNode(parent.activeItem)) this.closePreview();
        this.updateUrlPath(ipfsData.path);
        await this.openFile(ipfsData);
    }

    private onActionButton(target: TreeView, actionButton: Button, event: MouseEvent) {
        this.currentItem = target.activeItem;
        if (actionButton.tag === 'folder') {
            this.addNewFolder(true);
        } else {
            const ipfsData = this.currentItem?.tag;
            this.updateUrlPath(ipfsData.path);
            if (ipfsData.type === 'folder') {
                this.onOpenFolder(ipfsData, true);
            }
            this.mdActions.parent = this.currentItem;
            const isFile = ipfsData.type === 'file';
            const firstChild = this.mdActions.item?.children[0] as Control;
            if (firstChild) {
                firstChild.visible = !isFile;
            }
            this.mdActions.visible = true;
        }
    }

    showLoadingSpinner() {
        if (!this.loadingSpinner) {
            this.loadingSpinner = new LoadingSpinner();
            this.pnlLoading.append(this.loadingSpinner);
        }
        this.pnlLoading.visible = true;
    }

    hideLoadingSpinner() {
        this.pnlLoading.visible = false;
    }

    private async getNewName(parentNode: any, name: string) {
        let newName = name;
        while (await parentNode.findItem(newName)) {
            const regex = /(\d+)$/;
            const matches = newName.match(regex);
            if (matches) {
                const lastNumber = parseInt(matches[1]);
                const updatedString = newName.replace(/\s\d+$/, '');
                newName = `${updatedString} ${lastNumber + 1}`;
            } else {
                newName = `${newName} 1`;
            }
        }
        return newName;
    }

    private async onNameChange(target: TreeView, node: TreeNode, oldValue: string, newValue: string) {
        this.showLoadingSpinner();
        const path = node.tag.path;
        const fileNode = await this.manager.getFileNode(path);
        const folderName = await this.getNewName(fileNode.parent, newValue);
        await this.manager.updateFolderName(fileNode, folderName);
        await this.manager.applyUpdates();
        const url = this.extractUrl();
        const paths = url.path.split('/');
        paths.pop();
        paths.push(fileNode.name);
        const newPath = paths.join('/');
        await this.onFilesUploaded(newPath);
        this.hideLoadingSpinner();
    }

    private onRenameFolder() {
        this.mdActions.visible = false;
        this.currentItem.edit();
    }

    private async onDeleteFolder() {
        this.showLoadingSpinner();
        this.mdActions.visible = false;
        const fileNode = await this.manager.getFileNode(this.currentItem.tag.path);
        this.manager.delete(fileNode);
        await this.manager.applyUpdates();
        const url = this.extractUrl();
        const paths = url.path.split('/');
        paths.pop();
        const newPath = paths.join('/');
        await this.onFilesUploaded(newPath);
        this.hideLoadingSpinner();
    }

    private onAddNewFolder() {
        this.mdActions.visible = false;
        this.addNewFolder();
    }

    async addNewFolder(isRoot?: boolean) {
        this.showLoadingSpinner();
        let fileNode;
        if (isRoot) {
            fileNode = await this.getAssetRootNode();
        } else {
            fileNode = await this.manager.getFileNode(this.currentItem.tag.path);
        }
        const folderName = await this.getNewName(isRoot ? fileNode : fileNode.parent, 'New folder');
        await this.manager.addFolder(fileNode, folderName);
        await this.manager.applyUpdates();
        await this.onFilesUploaded();
        this.hideLoadingSpinner();
    }

    private async onOpenFolder(ipfsData: any, toggle: boolean) {
        if (ipfsData) {
            this.currentCid = ipfsData.cid;
            const childrenData = await this.onFetchData(ipfsData);
            this.onUpdateContent({ data: { ...childrenData }, toggle });
            this.fileTable.data = this.processTableData({ ...childrenData });
            this.selectedRow = null;
        }
    }

    private async onFetchData(ipfsData: any) {
        let fileNode;
        if (ipfsData.path) {
            fileNode = await this.manager.getFileNode(ipfsData.path);
        } else {
            fileNode = await this.getAssetRootNode();
        }
        if (!fileNode._cidInfo.links) fileNode._cidInfo.links = [];
        if (fileNode._cidInfo.links.length) {
            fileNode._cidInfo.links = await this.constructLinks(ipfsData, fileNode._cidInfo.links);
        }
        if (!fileNode._cidInfo.name) {
            if (ipfsData.name) fileNode._cidInfo.name = ipfsData.name;
            else if (fileNode.name) fileNode._cidInfo.name = fileNode.name;
        }
        fileNode._cidInfo.path = ipfsData.path;
        return fileNode._cidInfo;
    }

    private processTableData(ipfsData: IIPFSData) {
        const processedData = [];
        if (ipfsData && ipfsData.links && ipfsData.links.length) {
            const sortFn = (a: IIPFSData, b: IIPFSData) => a.name.localeCompare(b.name);
            const folders = [...ipfsData.links].filter(item => item.type === 'dir').sort(sortFn);
            const files = [...ipfsData.links].filter(item => item.type === 'file').sort(sortFn);
            [...folders, ...files].forEach((data) => {
                processedData.push({
                    checkbox: '',
                    name: data.name,
                    cid: data.cid,
                    type: data.type,
                    size: data.size,
                    path: data.path,
                    blank: '',
                });
            });
        }
        return processedData;
    }

    private onCellClick(target: Table, rowIndex: number, columnIdx: number, record: ITableData) {
        this.iePreview.clear();
        if (!record) return;
        this.updateUrlPath(record.path);
        if (record.type === 'dir') {
            this.closePreview();
            this.onOpenFolder(record, true);
        } else {
            this.currentFile = `${record.name}`;
            if (this.selectedRow) this.selectedRow.classList.remove(selectedRowStyle);
            this.selectedRow = this.fileTable.querySelector(`tr[data-index="${rowIndex}"]`);
            this.selectedRow.classList.add(selectedRowStyle);
            this.previewFile(record);
        }
    }


    private previewFile(record: IPreview) {
        if (this.isModal || this.isUploadModal) {
            this.pnlPreview.visible = false;
            return;
        }
        this.pnlPreview.visible = true;
        const currentCid = window.matchMedia('(max-width: 767px)').matches ? this.mobileHome.currentCid : this.currentCid;
        const config = this.getFileConfig(record);
        this.iePreview.setData({ ...record, parentCid: currentCid, config });
        if (window.matchMedia('(max-width: 767px)').matches) {
            this.iePreview.openModal({
                width: '100vw',
                height: '100vh',
                padding: { top: 0, bottom: 0, left: 0, right: 0 },
                border: { radius: 0 },
                overflow: 'auto',
                class: previewModalStyle,
                title: 'File Preview',
                closeIcon: {
                    name: 'times',
                    width: '1rem', height: '1rem'
                },
                onClose: () => {
                    if (!window.matchMedia('(max-width: 767px)').matches) {
                        this.pnlPreview.appendChild(this.iePreview);
                        this.closeEditor();
                        this.closePreview();
                    }
                    if (this.onClosePreview) this.onClosePreview();
                }
            })
        } else {
            if (!this.pnlPreview.contains(this.iePreview)) this.pnlPreview.appendChild(this.iePreview);
            this.pnlPreview.visible = true;
            this.btnUpload.right = '23.125rem';
        }
        if (this.onPreview) this.onPreview();
    }

    private onCellDblClick(target: Table, event: MouseEvent) {
        event.stopPropagation();
        const eventTarget = event.target as HTMLElement;
        const rowElm = eventTarget.closest('.i-table-row') as HTMLElement;
        const rowIndex = rowElm?.getAttribute('data-index') || -1;
        const rowData = target.data[rowIndex];
        if (rowData) this.openFile(rowData);
    }

    private closePreview() {
        this.pnlPreview.visible = false;
        this.btnUpload.right = '3.125rem';
        if (this.onClosePreview) this.onClosePreview();
    }

    private openEditor() {
        const path = this.iePreview.previewPath;
        if (path?.includes('scconfig.json')) {
            const newPath = path.split('scconfig.json')[0];
            this.updateUrlPath(newPath);
        }
        this.ieSidebar.visible = false;
        this.ieContent.visible = false;
        this.pnlPreview.visible = true;
        this.pnlPreview.width = '100%';
        this.pnlPreview.left = 0;
        this.btnUpload.visible = false;
    }

    private closeEditor() {
        this.ieSidebar.visible = true;
        this.ieSidebar.display = 'flex';
        this.ieContent.visible = true;
        this.pnlPreview.visible = false;
        this.pnlPreview.width = '20rem';
        this.pnlPreview.left = 'auto';
        this.btnUpload.visible = !this.isUploadModal;
    }

    private async onSubmit(filePath?: string, content?: string) {
        if (filePath && content) {
            await this.manager.addFileContent(filePath, content);
            await this.manager.applyUpdates();
        }
        this.onFilesUploaded();
    }

    private onBreadcrumbClick({ cid, path }: { cid: string; path: string }) {
        if (this.uploadedFileTree.activeItem)
            this.uploadedFileTree.activeItem.expanded = true;
        this.closePreview();
        this.updateUrlPath(path);
        this.onOpenFolder({ cid, path }, false);
    }

    private getDestinationFolder(event: DragEvent) {
        const folder = { path: '', name: '' };
        const target = event.target as Control;
        if (target) {
            let tableColumn: TableColumn;
            if (target.nodeName === 'TD') {
                tableColumn = target.childNodes?.[0] as TableColumn;
            } else {
                tableColumn = target.closest('i-table-column') as TableColumn;
            }
            const rowData: any = tableColumn?.rowData;
            if (rowData?.type === 'dir') {
                folder.path = rowData.path;
                folder.name = rowData.name || FormatUtils.truncateWalletAddress(rowData.cid);
            }
        }
        if (!folder.path) {
            if (window.matchMedia('(max-width: 767px)').matches) {
                folder.path = this.mobileHome.currentPath;
            } else {
                folder.path = this.pnlPath.data.path;
            }
            const arr = folder.path.split('/');
            folder.name = arr[arr.length - 1] || 'root';
        }
        return folder;
    }

    private handleOnDragEnter(event: DragEvent) {
        if (this.readOnly) return;
        event.preventDefault();
        this.counter++;
        this.pnlFileTable.classList.add(dragAreaStyle);
    }

    private handleOnDragOver(event: DragEvent) {
        if (this.readOnly) return;
        event.preventDefault();
        const folder = this.getDestinationFolder(event);
        this.lblDestinationFolder.caption = folder.name || "root";
        this.pnlUploadTo.visible = true;
    }

    private handleOnDragLeave(event: DragEvent) {
        if (this.readOnly) return;
        this.counter--;
        if (this.counter === 0) {
            this.pnlFileTable.classList.remove(dragAreaStyle);
            this.pnlUploadTo.visible = false;
        }
    }

    private async handleOnDrop(event: DragEvent) {
        if (this.readOnly) return;
        event.preventDefault();
        this.counter = 0;
        this.pnlFileTable.classList.remove(dragAreaStyle);
        this.pnlUploadTo.visible = false;
        const folder = this.getDestinationFolder(event);
        try {
            const files = await this.getAllFileEntries(event.dataTransfer.items);
            const flattenFiles = files.reduce((acc, val) => acc.concat(val), []);
            this.onOpenUploadModal(folder.path, flattenFiles);
        } catch (err) {
            console.log('Error! ', err);
        }
    }

    // Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
    private async readAllDirectoryEntries(
        directoryReader: FileSystemDirectoryReader
    ) {
        let entries = [];
        let readEntries: any = await this.readEntriesPromise(directoryReader);
        while (readEntries.length > 0) {
            entries.push(...readEntries);
            readEntries = await this.readEntriesPromise(directoryReader);
        }
        return entries;
    }

    // Wrap readEntries in a promise to make working with readEntries easier
    private async readEntriesPromise(directoryReader: FileSystemDirectoryReader) {
        try {
            return await new Promise((resolve, reject) => {
                directoryReader.readEntries(resolve, reject);
            });
        } catch (err) {
            console.log(err);
        }
    }

    private async readEntryContentAsync(entry: FileSystemEntry | any) {
        return new Promise<UploadRawFile[]>((resolve, reject) => {
            let reading = 0;
            const contents: UploadRawFile[] = [];

            reading++;
            entry.file(async (file: any) => {
                reading--;
                const rawFile = file as UploadRawFile;
                rawFile.path = entry.fullPath;
                rawFile.cid = await IPFS.hashFile(file);
                contents.push(rawFile);

                if (reading === 0) {
                    resolve(contents);
                }
            });
        });
    }

    private async getAllFileEntries(dataTransferItemList: DataTransferItemList) {
        let fileEntries = [];
        // Use BFS to traverse entire directory/file structure
        let queue = [];
        // Unfortunately dataTransferItemList is not iterable i.e. no forEach
        for (let i = 0; i < dataTransferItemList.length; i++) {
            // Note webkitGetAsEntry a non-standard feature and may change
            // Usage is necessary for handling directories
            queue.push(dataTransferItemList[i].webkitGetAsEntry());
        }
        while (queue.length > 0) {
            let entry = queue.shift();
            if (entry?.isFile) {
                fileEntries.push(entry);
            } else if (entry?.isDirectory) {
                let reader: any = (entry as any).createReader();
                queue.push(...(await this.readAllDirectoryEntries(reader)));
            }
        }

        return Promise.all(
            fileEntries.map((entry) => this.readEntryContentAsync(entry))
        );
    }

    private onOpenHandler() {
        const currentCid = window.matchMedia('(max-width: 767px)').matches ? this.mobileHome.currentCid : this.currentCid;
        if (!currentCid || !this.currentFile) return;
        const url = `${this.transportEndpoint}/ipfs/${currentCid}/${this.currentFile}`;
        this.currentFile = null;
        if (this.onOpen) this.onOpen(url);
    }

    private onCancelHandler() {
        this.currentFile = null;
        if (this.onCancel) this.onCancel();
    }

    private renderUploadModal() {
        if (!this.uploadModal) {
            this.uploadModal = new ScomIPFSUploadModal();
            this.uploadModal.onUploaded = async (target: ScomIPFSUploadModal, rootCid: string, filePaths: string[]) => {
                this.onFilesUploaded();
                if (!this.uploadMultiple && filePaths.length && this.onUploadedFile) {
                    let parentCid;
                    const arr = filePaths[0].split('/');
                    const parentPath = arr.slice(0, -1).join('/');
                    const fileName = arr.slice(-1)[0];
                    if (parentPath) {
                        let fileNode = await this.manager.getFileNode(parentPath);
                        parentCid = fileNode.cid
                    } else {
                        parentCid = rootCid;
                    }
                    const url = `${this.transportEndpoint}/ipfs/${parentCid}/${fileName}`;
                    this.onUploadedFile(url);
                }
            }
            this.uploadModal.onBrowseFile = () => {
                this.pnlStorage.visible = true;
                this.pnlUpload.visible = false;
                this.pnlFooter.visible = true;
                this.iconBack.visible = true;
            }
        }
        this.pnlUpload.appendChild(this.uploadModal);
        this.uploadModal.mulitiple = this.uploadMultiple;
        this.uploadModal.isBrowseButtonShown = true;
    }

    async uploadFiles(files: UploadRawFile[]) {
        let result: { fileName: string, path: string }[] = [];
        try {
            for (const file of files) {
                let filePath = file.path;
                const { isExists, newFilePath } = await isFileExists(this.manager, filePath);
                if (isExists) {
                    filePath = newFilePath;
                }
                const data = await this.manager.addFile(filePath, file);
                result.push({
                    fileName: file.name,
                    path: data.file.name
                })
            }
            await this.manager.applyUpdates();
            const rootNode = await this.manager.getRootNode();
            const path = `${this.transportEndpoint}/ipfs/${rootNode.cid}`;
            result = result.map(v => {
                return {
                    ...v,
                    path: `${path}/${v.path}`
                }
            })
        } catch (error) {
            console.log('uploadFiles', error);
        }
        return result;
    }

    private handleBack() {
        if (!this.isUploadModal) return;
        this.pnlStorage.visible = false;
        this.pnlFooter.visible = false;
        this.uploadModal.reset();
        this.pnlUpload.visible = true;
        this.iconBack.visible = false;
    }

    init() {
        const transportEndpoint = this.getAttribute('transportEndpoint', true) || this._data?.transportEndpoint || window.location.origin;
        const signer = this.getAttribute('signer', true) || this._data?.signer || null;
        this._signer = signer;
        this.baseUrl = this.getAttribute('baseUrl', true);
        super.init();
        this.isModal = this.getAttribute('isModal', true) || this._data.isModal || false;
        this.isUploadModal = this.getAttribute('isUploadModal', true) || this._data.isUploadModal || false;
        if (this.isUploadModal) {
            this.renderUploadModal();
        }
        this.onOpen = this.getAttribute('onOpen', true) || this.onOpen;
        this.onCancel = this.getAttribute('onCancel', true) || this.onCancel;
        this.onPreview = this.getAttribute('onPreview', true) || this.onPreview;
        this.onClosePreview = this.getAttribute('onClosePreview', true) || this.onClosePreview;
        this.onUploadedFile = this.getAttribute('onUploadedFile', true) || this.onUploadedFile;
        this.isFileShown = this.getAttribute('isFileShown', true);
        this.classList.add(customStyles);
        this.setTag(defaultColors);
        this.manager = new IPFS.FileManager({
            endpoint: transportEndpoint,
            signer: signer
        });
        if (transportEndpoint) this.setData({ transportEndpoint, signer, isModal: this.isModal, isUploadModal: this.isUploadModal });
        this.handleOnDragEnter = this.handleOnDragEnter.bind(this);
        this.handleOnDragOver = this.handleOnDragOver.bind(this);
        this.handleOnDragLeave = this.handleOnDragLeave.bind(this);
        this.handleOnDrop = this.handleOnDrop.bind(this);
        this.pnlFileTable.addEventListener('dragenter', this.handleOnDragEnter);
        this.pnlFileTable.addEventListener('dragover', this.handleOnDragOver);
        this.pnlFileTable.addEventListener('dragleave', this.handleOnDragLeave);
        this.pnlFileTable.addEventListener('drop', this.handleOnDrop);
        this.initModalActions();
    }

    render() {
        return (
            <i-vstack
                width={'100%'} height={'100%'}
                overflow={'hidden'}
            >
                <i-icon
                    id="iconBack"
                    width="1rem"
                    height="1rem"
                    position="absolute"
                    name="arrow-left"
                    top={10}
                    zIndex={1}
                    cursor="pointer"
                    visible={false}
                    onClick={this.handleBack}
                ></i-icon>
                <i-panel id="pnlUpload" visible={false}></i-panel>
                <i-panel
                    id="pnlStorage"
                    height={'100%'} width={'100%'}
                    stack={{ grow: '1' }}
                    overflow={{ y: 'auto' }}
                >
                    <i-vstack id="pnlLoading" visible={false} />
                    <i-scom-ipfs--mobile-home
                        id="mobileHome"
                        width={'100%'}
                        minHeight={'100vh'}
                        display='block'
                        background={{ color: Theme.background.main }}
                        onPreview={this.previewFile.bind(this)}
                        transportEndpoint={this.transportEndpoint}
                        signer={this.signer}
                        visible={false}
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    visible: true
                                }
                            }
                        ]}
                    />
                    <i-vstack
                        height={'100%'}
                        width={'100%'}
                        overflow={'hidden'}
                        maxHeight={'100vh'}
                        background={{ color: Theme.background.main }}
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    visible: false,
                                    maxWidth: '100%'
                                }
                            }
                        ]}
                    >
                        <i-panel stack={{ grow: '1', basis: '0%' }} overflow={'hidden'}>
                            <i-grid-layout
                                id={'gridWrapper'}
                                height={'100%'}
                                width={'100%'}
                                overflow={'hidden'}
                                position='relative'
                                templateColumns={['15rem', '1fr']}
                                background={{ color: Theme.background.main }}
                            >
                                <i-vstack
                                    id={'ieSidebar'}
                                    resizer={true} dock="left"
                                    height={'100%'} overflow={{ y: 'auto', x: 'hidden' }}
                                    minWidth={'10rem'} width={'15rem'}
                                    border={{ right: { width: '1px', style: 'solid', color: Theme.divider } }}
                                >
                                    <i-tree-view
                                        id="uploadedFileTree"
                                        class="file-manager-tree uploaded"
                                        stack={{ grow: '1' }}
                                        maxHeight={'100%'}
                                        overflow={'auto'}
                                        editable
                                        actionButtons={[
                                            {
                                                caption: `<i-icon name="ellipsis-h" width=${14} height=${14} class="inline-flex"></i-icon>`,
                                                tag: 'actions',
                                                class: 'btn-actions'
                                            },
                                            {
                                                caption: `<i-icon name="folder-plus" width=${14} height=${14} class="inline-flex"></i-icon>`,
                                                tag: 'folder',
                                                class: 'btn-folder'
                                            }
                                        ]}
                                        onActionButtonClick={this.onActionButton}
                                        onActiveChange={this.onActiveChange}
                                        onChange={this.onNameChange}
                                    />
                                </i-vstack>
                                <i-vstack
                                    id={'ieContent'}
                                    dock='fill'
                                    height={'100%'}
                                    overflow={{ y: 'auto' }}
                                >
                                    <i-scom-ipfs--path
                                        id="pnlPath"
                                        display='flex' width={'100%'}
                                        padding={{ left: '1rem', right: '1rem' }}
                                        onItemClicked={this.onBreadcrumbClick}
                                    />
                                    <i-panel
                                        width={'100%'} height={'auto'}
                                        stack={{ grow: "1" }}
                                        position="relative"
                                        border={{
                                            top: { width: '0.0625rem', style: 'solid', color: Theme.colors.primary.contrastText }
                                        }}
                                    >
                                        <i-panel
                                            id="pnlFileTable"
                                            height="100%"
                                        >
                                            <i-table
                                                id="fileTable"
                                                heading={true}
                                                columns={this.columns}
                                                headingStyles={{
                                                    font: { size: '0.75rem', weight: 700, color: Theme.text.primary },
                                                    padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' },
                                                    height: '2rem',
                                                    background: { color: '#f8f9fa' }
                                                }}
                                                bodyStyles={{
                                                    font: { size: '0.75rem', color: Theme.text.primary },
                                                    padding: { top: '0.375rem', bottom: '0.375rem', left: '0.5rem', right: '0.5rem' },
                                                    height: '2.25rem',
                                                    cursor: 'pointer'
                                                }}
                                                onCellClick={this.onCellClick}
                                                onDblClick={this.onCellDblClick}
                                            ></i-table>
                                        </i-panel>
                                        <i-panel
                                            id="pnlUploadTo"
                                            width="fit-content"
                                            class="text-center"
                                            padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                            margin={{ left: 'auto', right: 'auto' }}
                                            border={{ radius: 6 }}
                                            background={{ color: '#0288d1' }}
                                            lineHeight={1.5}
                                            position="absolute"
                                            bottom="1.5rem"
                                            left={0}
                                            right={0}
                                            visible={false}
                                        >
                                            <i-label caption="Upload files to" font={{ size: '15px', color: '#fff' }}></i-label>
                                            <i-hstack horizontalAlignment="center" verticalAlignment="center" gap="0.375rem">
                                                <i-icon name="folder" width={'0.875rem'} height={'0.875rem'} display="inline-flex" fill='#fff'></i-icon>
                                                <i-label id="lblDestinationFolder" font={{ size: '15px', color: '#fff' }}></i-label>
                                            </i-hstack>
                                        </i-panel>
                                    </i-panel>
                                </i-vstack>
                                <i-vstack
                                    id="pnlCustom"
                                    visible={false}
                                    dock='fill'
                                    height={'100%'}
                                    overflow={{ y: 'auto' }}
                                ></i-vstack>
                                <i-panel
                                    id="pnlPreview"
                                    border={{ left: { width: '1px', style: 'solid', color: Theme.divider } }}
                                    width={'20rem'}
                                    dock='right'
                                    visible={false}
                                >
                                    <i-scom-ipfs--preview
                                        id="iePreview"
                                        width={'100%'}
                                        height={'100%'}
                                        display='block'
                                        onClose={this.closePreview.bind(this)}
                                        onOpenEditor={this.openEditor.bind(this)}
                                        onCloseEditor={this.closeEditor.bind(this)}
                                        onFileChanged={this.onSubmit.bind(this)}
                                    />
                                </i-panel>
                            </i-grid-layout>
                        </i-panel>
                    </i-vstack>
                    <i-button
                        id="btnUpload"
                        boxShadow='0 10px 25px -5px rgba(44, 179, 240, 0.6)'
                        border={{ radius: '50%' }}
                        background={{ color: Theme.colors.primary.light }}
                        lineHeight={'3.375rem'}
                        width={'3.375rem'} height={'3.375rem'}
                        icon={{ name: 'plus', width: '1.125rem', height: ' 1.125rem', fill: Theme.colors.primary.contrastText }}
                        position='absolute' bottom={'3.125rem'} right={'3.125rem'} zIndex={100}
                        onClick={this.handleUploadButtonClick}
                        mediaQueries={[
                            {
                                maxWidth: '767px',
                                properties: {
                                    position: 'fixed',
                                    bottom: '4rem',
                                    right: '1.25rem'
                                }
                            }
                        ]}
                    ></i-button>
                </i-panel>
                <i-hstack
                    id="pnlFooter"
                    horizontalAlignment='end'
                    gap="0.75rem"
                    stack={{ shrink: '0' }}
                    padding={{ top: '1rem', bottom: '1rem' }}
                    visible={false}
                >
                    <i-button
                        id="btnSubmit"
                        height={'2.25rem'}
                        padding={{ left: '1rem', right: '1rem' }}
                        background={{ color: Theme.colors.primary.main }}
                        font={{ color: Theme.colors.primary.contrastText, bold: true, size: '1rem' }}
                        border={{ radius: '0.25rem' }}
                        caption="Select"
                        onClick={this.onOpenHandler}
                    ></i-button>
                    <i-button
                        id="btnBack"
                        height={'2.25rem'}
                        padding={{ left: '1rem', right: '1rem' }}
                        background={{ color: 'transparent' }}
                        font={{ color: Theme.colors.primary.main, bold: true, size: '1rem' }}
                        border={{ width: 1, style: 'solid', color: Theme.colors.primary.main, radius: '0.25rem' }}
                        caption="Back to Upload"
                        visible={false}
                        onClick={this.handleBack}
                    ></i-button>
                    <i-button
                        id="btnCancel"
                        height={'2.25rem'}
                        padding={{ left: '1rem', right: '1rem' }}
                        background={{ color: 'transparent' }}
                        font={{ color: Theme.colors.primary.main, bold: true, size: '1rem' }}
                        border={{ radius: '0.25rem' }}
                        caption="Cancel"
                        onClick={this.onCancelHandler}
                    ></i-button>
                </i-hstack>
            </i-vstack>
        )
    }
}
