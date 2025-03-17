var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-storage/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-storage/data.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFileContent = exports.formatBytes = void 0;
    ///<amd-module name='@scom/scom-storage/data.ts'/> 
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };
    exports.formatBytes = formatBytes;
    const getFileContent = async (url) => {
        let result = '';
        if (url) {
            const response = await fetch(url);
            try {
                if (response.ok) {
                    result = await response.text();
                }
            }
            catch (err) { }
        }
        return result;
    };
    exports.getFileContent = getFileContent;
});
define("@scom/scom-storage/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_1.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    exports.default = {
        fullPath
    };
});
define("@scom/scom-storage/components/index.css.ts", ["require", "exports", "@ijstech/components", "@scom/scom-storage/assets.ts"], function (require, exports, components_2, assets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fullScreenStyle = exports.customLinkStyle = exports.addressPanelStyle = exports.transitionStyle = exports.backgroundStyle = void 0;
    const Theme = components_2.Styles.Theme.ThemeVars;
    exports.backgroundStyle = components_2.Styles.style({
        backgroundColor: Theme.divider,
        aspectRatio: '3 / 2',
        '-webkit-mask': `url(${assets_1.default.fullPath('img/bg.svg')}) no-repeat 100% 100%`,
        mask: `url(${assets_1.default.fullPath('img/bg.svg')}) no-repeat 100% 100%`,
        '-webkit-mask-size': 'cover',
        maskSize: 'cover'
    });
    exports.transitionStyle = components_2.Styles.style({
        '-webkit-transition': 'width 0.4s ease-in-out',
        transition: 'width 0.4s ease-in-out'
    });
    exports.addressPanelStyle = components_2.Styles.style({
        '-ms-overflow-style': 'none',
        scrollbarWidth: 'none',
        $nest: {
            '&::-webkit-scrollbar': {
                display: 'none'
            },
            'i-button': {
                whiteSpace: 'nowrap'
            }
        }
    });
    exports.customLinkStyle = components_2.Styles.style({
        $nest: {
            'a': {
                color: `${Theme.colors.primary.main}!important`,
                display: `inline !important`,
            },
            'img': {
                maxWidth: '100%'
            }
        }
    });
    exports.fullScreenStyle = components_2.Styles.style({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: Theme.background.modal
    });
});
define("@scom/scom-storage/components/path.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-storage/components/index.css.ts"], function (require, exports, components_3, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomIPFSPath = void 0;
    const Theme = components_3.Styles.Theme.ThemeVars;
    let ScomIPFSPath = class ScomIPFSPath extends components_3.Module {
        constructor(parent, options) {
            super(parent, options);
            this.breadcrumb = {};
            this._data = {
                cid: ''
            };
            this._isMobileView = false;
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }
        get isMobileView() {
            return this._isMobileView;
        }
        set isMobileView(value) {
            this._isMobileView = value;
        }
        setData(value) {
            this._data = value;
            this.onUpdateBreadcumbs(value);
        }
        clear() {
            this.pnlAddress.clearInnerHTML();
            this.pnlAddress.visible = false;
            this.breadcrumb = {};
            this._data = {
                cid: ''
            };
        }
        onUpdateBreadcumbs(node) {
            if (node) {
                if (!this.breadcrumb[node.path]) {
                    this.breadcrumb[node.path] = node;
                }
                const nodePaths = this.splitPath(node.path);
                const elmPath = [];
                if (nodePaths?.length) {
                    for (let nodePath of nodePaths) {
                        const data = this.breadcrumb[nodePath];
                        if (data) {
                            const folderName = data.name || components_3.FormatUtils.truncateWalletAddress(data.cid) || '';
                            const item = (this.$render("i-hstack", { verticalAlignment: "center", gap: "0.25rem" },
                                nodePath != node.path ? (this.$render("i-button", { caption: folderName, font: { size: this.isMobileView ? '0.875rem' : '0.75rem' }, boxShadow: 'none', background: { color: 'transparent' }, onClick: () => this.onBreadcrumbClick({ cid: data.cid, path: nodePath }) })) : (this.$render("i-label", { caption: folderName, font: { size: this.isMobileView ? '0.875rem' : '0.75rem' }, textOverflow: "ellipsis" })),
                                this.$render("i-icon", { name: "chevron-right", width: "0.675rem", height: "0.675rem", fill: Theme.text.primary })));
                            elmPath.push(item);
                        }
                    }
                    this.pnlAddress.clearInnerHTML();
                    this.pnlAddress.visible = !!elmPath.length;
                    this.pnlAddress.append(...elmPath);
                    this.pnlAddress.scrollLeft = this.pnlAddress.scrollWidth;
                }
            }
        }
        async onBreadcrumbClick({ cid, path }) {
            if (this.onItemClicked)
                this.onItemClicked({ cid, path });
        }
        splitPath(path) {
            const array = path.split('/');
            let i = 0;
            let final = [];
            while (i < array.length) {
                final.push(`${array
                    .slice(0, i + 1)
                    .join('/')
                    .toString()}`);
                i++;
            }
            return final;
        }
        init() {
            super.init();
            this.onItemClicked = this.getAttribute('onItemClicked', true) || this.onItemClicked;
            this.isMobileView = this.getAttribute('isMobileView', true, false);
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
        }
        render() {
            return (this.$render("i-hstack", { id: 'pnlAddress', class: index_css_1.addressPanelStyle, verticalAlignment: "center", padding: { top: '0.5rem', bottom: '0.5rem' }, height: 35, gap: '0.25rem', overflow: { x: 'auto', y: 'hidden' }, visible: false }));
        }
    };
    ScomIPFSPath = __decorate([
        (0, components_3.customElements)('i-scom-ipfs--path')
    ], ScomIPFSPath);
    exports.ScomIPFSPath = ScomIPFSPath;
});
define("@scom/scom-storage/translations.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-storage/translations.json.ts'/> 
    exports.default = {
        "en": {
            "all_data_uploaded_to_ipfs_explorer_is_available_to_anyone_who_requests_it_using_the_correct_cid_do_not_store_any_private_or_sensitive_information_in_an_unencrypted_form_using_ipfs_explorer": "All data uploaded to IPFS Explorer is available to anyone who requests it using the correct CID. Do not store any private or sensitive information in an unencrypted form using IPFS Explorer.",
            "all_files": "All Files",
            "all_folders": "All Folders",
            "all": "All",
            "back_to_upload": "Back to Upload",
            "browse_file": "Browse File",
            "cancel": "Cancel",
            "choose_file_to_upload_to_ipfs_network": "Choose file to upload to IPFS network",
            "clear": "Clear",
            "completed": "Completed",
            "confirm": "Confirm",
            "delete": "Delete",
            "deleting_files_from_the_ipfs_explorer_sites_files_page_will_remove_them_from_the_file_listing_for_your_account_but_that_doesnt_prevent_nodes_on_the_decentralized_storage_network_from_retaining_copies_of_the_data_indefinitely_do_not_use_ipfs_explorer_for_data_that_may_need_to_be_permanently_deleted_in_the_future": "Deleting files from the IPFS Explorer site’s Files page will remove them from the file listing for your account, but that doesn’t prevent nodes on the decentralized storage network from retaining copies of the data indefinitely. Do not use IPFS Explorer for data that may need to be permanently deleted in the future.",
            "do_you_want_to_discard_changes": "Do you want to discard changes?",
            "drag_and_drop_your_files_here": "Drag and drop your files here",
            "edit": "Edit",
            "fail": "Fail",
            "failed": "Failed",
            "file_preview": "File Preview",
            "name": "Name",
            "new_folder": "New folder",
            "or": "Or",
            "permanent_data": "Permanent Data",
            "processing_your_files": "Processing your files...",
            "public_data": "Public Data",
            "rename": "Rename",
            "save": "Save",
            "select_files": "Select Files",
            "select": "Select",
            "size": "Size",
            "success": "Success",
            "type": "Type",
            "upload_file_to_ipfs": "Upload file to IPFS",
            "upload_files_to": "Upload files to",
            "upload_more_files": "Upload more files",
            "upload": "Upload",
            "uploading_file_to_ipfs": "Uploading file(s) to IPFS...",
            "uploading": "Uploading",
        },
        "zh-hant": {
            "all_data_uploaded_to_ipfs_explorer_is_available_to_anyone_who_requests_it_using_the_correct_cid_do_not_store_any_private_or_sensitive_information_in_an_unencrypted_form_using_ipfs_explorer": "所有上傳到 IPFS Explorer 的數據都可以通過使用正確的 CID 請求的任何人使用。請勿使用 IPFS Explorer 以未加密形式存儲任何私人或敏感信息。",
            "all_files": "所有文件",
            "all_folders": "所有文件夾",
            "all": "所有",
            "back_to_upload": "返回上傳",
            "browse_file": "瀏覽文件",
            "cancel": "取消",
            "choose_file_to_upload_to_ipfs_network": "選擇要上傳到 IPFS 網絡的文件",
            "clear": "清除",
            "completed": "已完成",
            "confirm": "確認",
            "delete": "刪除",
            "deleting_files_from_the_ipfs_explorer_sites_files_page_will_remove_them_from_the_file_listing_for_your_account_but_that_doesnt_prevent_nodes_on_the_decentralized_storage_network_from_retaining_copies_of_the_data_indefinitely_do_not_use_ipfs_explorer_for_data_that_may_need_to_be_permanently_deleted_in_the_future": "從 IPFS Explorer 站點的文件頁面刪除文件將從您的帳戶的文件列表中刪除它們，但這不會阻止分散式存儲網絡上的節點無限期保留數據的副本。請勿使用 IPFS Explorer 用於可能需要在將來永久刪除的數據。",
            "do_you_want_to_discard_changes": "您要放棄更改嗎？",
            "drag_and_drop_your_files_here": "將文件拖放到此處",
            "edit": "編輯",
            "fail": "失敗",
            "failed": "失敗",
            "file_preview": "文件預覽",
            "name": "名稱",
            "new_folder": "新文件夾",
            "or": "或",
            "permanent_data": "永久數據",
            "processing_your_files": "正在處理您的文件...",
            "public_data": "公共數據",
            "rename": "重命名",
            "save": "保存",
            "select_files": "選擇文件",
            "select": "選擇",
            "size": "大小",
            "success": "成功",
            "type": "類型",
            "upload_file_to_ipfs": "上傳文件到 IPFS",
            "upload_files_to": "上傳文件到",
            "upload_more_files": "上傳更多文件",
            "upload": "上傳",
            "uploading_file_to_ipfs": "正在上傳文件到 IPFS...",
            "uploading": "正在上傳"
        },
        "vi": {
            "all_data_uploaded_to_ipfs_explorer_is_available_to_anyone_who_requests_it_using_the_correct_cid_do_not_store_any_private_or_sensitive_information_in_an_unencrypted_form_using_ipfs_explorer": "Tất cả dữ liệu được tải lên IPFS Explorer đều có sẵn cho bất kỳ ai yêu cầu bằng cách sử dụng CID chính xác. Không lưu trữ bất kỳ thông tin cá nhân hoặc nhạy cảm nào dưới dạng không mã hóa khi sử dụng IPFS Explorer.",
            "all_files": "Tất cả tệp",
            "all_folders": "Tất cả thư mục",
            "all": "Tất cả",
            "back_to_upload": "Quay lại Tải lên",
            "browse_file": "Duyệt tệp",
            "cancel": "Hủy",
            "choose_file_to_upload_to_ipfs_network": "Chọn tệp để tải vào mạng IPFS",
            "clear": "Xóa",
            "completed": "Hoàn thành",
            "confirm": "Xác nhận",
            "delete": "Xóa",
            "deleting_files_from_the_ipfs_explorer_sites_files_page_will_remove_them_from_the_file_listing_for_your_account_but_that_doesnt_prevent_nodes_on_the_decentralized_storage_network_from_retaining_copies_of_the_data_indefinitely_do_not_use_ipfs_explorer_for_data_that_may_need_to_be_permanently_deleted_in_the_future": "Xóa tệp từ trang Tệp của trang web IPFS Explorer sẽ xóa chúng khỏi danh sách tệp trong tài khoản của bạn, nhưng điều đó không ngăn các nút trên mạng lưu trữ phi tập trung giữ lại các bản sao dữ liệu vô thời hạn. Không sử dụng IPFS Explorer cho dữ liệu có thể cần bị xóa vĩnh viễn trong tương lai",
            "do_you_want_to_discard_changes": "Bạn có muốn hủy thay đổi không?",
            "drag_and_drop_your_files_here": "Kéo và thả tệp của bạn vào đây",
            "edit": "Chỉnh sửa",
            "fail": "Thất bại",
            "failed": "Thất bại",
            "file_preview": "Xem trước tệp",
            "name": "Tên",
            "new_folder": "Thư mục mới",
            "or": "Hoặc",
            "permanent_data": "Dữ liệu cố định",
            "processing_your_files": "Đang xử lý tệp của bạn...",
            "public_data": "Dữ liệu công khai",
            "rename": "Đổi tên",
            "save": "Lưu",
            "select_files": "Chọn tệp",
            "select": "Chọn",
            "size": "Kích thước",
            "success": "Thành công",
            "type": "Loại",
            "upload_file_to_ipfs": "Tải tệp vào IPFS",
            "upload_files_to": "Tải tệp vào",
            "upload_more_files": "Tải nhiều tệp",
            "upload": "Tải lên",
            "uploading_file_to_ipfs": "Đang tải tệp vào IPFS...",
            "uploading": "Đang tải lên",
        }
    };
});
define("@scom/scom-storage/components/folder.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-storage/data.ts", "@scom/scom-storage/components/index.css.ts", "@scom/scom-storage/translations.json.ts"], function (require, exports, components_4, data_1, index_css_2, translations_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomIPFSFolder = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    let ScomIPFSFolder = class ScomIPFSFolder extends components_4.Module {
        constructor(parent, options) {
            super(parent, options);
            this.mode = 'list';
            this.sortMapping = {};
            this.pathMapping = {};
            this.onSort = this.onSort.bind(this);
            this.onChangeMode = this.onChangeMode.bind(this);
            this.onBreadcrumbClick = this.onBreadcrumbClick.bind(this);
            this.onSearchClicked = this.onSearchClicked.bind(this);
            this.onHandleSearch = this.onHandleSearch.bind(this);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get list() {
            return this._data?.list ?? [];
        }
        set list(value) {
            this._data.list = value ?? [];
        }
        get type() {
            return this._data?.type ?? 'dir';
        }
        set type(value) {
            this._data.type = value ?? 'dir';
        }
        get title() {
            return this._data?.title ?? '';
        }
        set title(value) {
            this._data.title = value ?? '';
        }
        get filteredList() {
            const value = this.inputSearch?.value || '';
            if (!value)
                return [...this.list];
            return [...this.list].filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
        }
        get isGridMode() {
            return this.mode === 'grid';
        }
        get currentPath() {
            return this._currentPath;
        }
        setData(data) {
            this._data = data;
            const path = this.pnlPath.data.path || '';
            this._currentPath = path;
            const sortData = this.sortMapping[path] ?? 'desc';
            const isDown = sortData === 'desc';
            this.iconSort.name = isDown ? 'angle-up' : 'angle-down';
            const sortFn = (a, b) => isDown ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            const folders = [...this.list].filter(item => item.type === 'dir').sort(sortFn);
            const files = [...this.list].filter(item => item.type === 'file').sort(sortFn);
            if (isDown) {
                this.list = [...folders, ...files];
            }
            else {
                this.list = [...files, ...folders];
            }
            this.renderUI();
        }
        clear() {
            this.pnlPath.clear();
            this.pathMapping = {};
        }
        updatePath(data) {
            if (data.path != null)
                this.pathMapping[data.path] = data;
            this.pnlPath.setData(data);
        }
        renderUI() {
            this.inputSearch.width = '0%';
            this.pnlSearch.width = '2rem';
            this.pnlPath.visible = true;
            this.inputSearch.value = '';
            const defaultTitle = this.type === 'dir' ? '$all_folders' : '$all_files';
            this.lblTitle.caption = this.title || defaultTitle;
            this.renderList();
        }
        async onBreadcrumbClick({ cid, path }) {
            let childData;
            if (this.pathMapping[path]) {
                childData = this.pathMapping[path];
            }
            else {
                childData = await this.onFetchData({ cid, path });
                this.pathMapping[path] = childData;
            }
            const paths = path.split('/');
            this.iconBack.visible = paths.length > 1;
            this.updatePath(childData);
            this.setData({ list: childData?.links ?? [], type: 'dir' });
        }
        renderList() {
            this.pnlFolders.templateColumns = this.isGridMode ? ['repeat(2, minmax(0, 1fr))'] : ['minmax(0, 1fr)'];
            this.pnlFolders.gap = this.isGridMode ? { column: '1rem', row: '1.5rem' } : { row: '1.5rem', column: '0px' };
            this.pnlFolders.clearInnerHTML();
            if (this.filteredList?.length) {
                const direction = this.isGridMode ? 'vertical' : 'horizontal';
                const align = this.isGridMode ? 'start' : 'center';
                const gap = this.isGridMode ? '0.5rem' : '1.5rem';
                const padding = this.isGridMode ?
                    { top: '0.5rem', bottom: '0.5rem', right: '0.5rem', left: '0.5rem' } :
                    { top: '0px', bottom: '0px', right: '0px', left: '0px' };
                for (let nodeData of this.filteredList) {
                    const isDir = nodeData.type === 'dir';
                    const nodeEl = (this.$render("i-stack", { direction: direction, alignItems: align, gap: gap, padding: padding, cursor: 'pointer', class: this.isGridMode ? index_css_2.backgroundStyle : '', onClick: () => this.onFolderClick(nodeData) },
                        this.$render("i-icon", { stack: { grow: '0', shrink: '0' }, name: isDir ? 'folder' : 'file', fill: isDir ? Theme.colors.warning.main : Theme.colors.info.main, width: '2.5rem', height: '2.5rem' }),
                        this.$render("i-vstack", { width: "100%", minWidth: 0, gap: '0.5rem' },
                            this.$render("i-label", { caption: nodeData.name, font: { weight: 600, size: '1.125rem' }, textOverflow: 'ellipsis' }),
                            this.$render("i-hstack", { verticalAlignment: 'center', gap: '0.5rem' },
                                this.$render("i-label", { caption: `${(0, data_1.formatBytes)(nodeData.size)}`, opacity: 0.5, font: { size: '0.675rem' } })))));
                    this.pnlFolders.append(nodeEl);
                }
            }
        }
        async handleFolderClick(data) {
            let childData;
            if (this.pathMapping[data.path]) {
                childData = this.pathMapping[data.path];
            }
            else {
                childData = await this.onFetchData(data);
                this.pathMapping[data.path] = childData;
            }
            if (!childData.name && data.name)
                childData.name = data.name;
            this.updatePath(childData);
            this.setData({ list: childData?.links ?? [], type: 'dir' });
            this.iconBack.visible = true;
        }
        async onFolderClick(data) {
            if (this.onItemClicked)
                this.onItemClicked(data);
            if (data.type === 'file')
                return;
            await this.handleFolderClick(data);
        }
        onSort(target) {
            const path = this.pnlPath.data.path || 'main';
            const oldSort = this.sortMapping[path] ?? 'desc';
            const currentSort = oldSort === 'desc' ? 'asc' : 'desc';
            this.iconSort.name = currentSort === 'desc' ? 'angle-up' : 'angle-down';
            this.list.reverse();
            this.sortMapping[path] = currentSort;
            this.renderList();
        }
        onChangeMode(target) {
            this.mode = this.isGridMode ? 'list' : 'grid';
            this.iconList.name = this.isGridMode ? 'list' : 'th-large';
            this.renderList();
        }
        goBack() {
            const paths = this._currentPath?.split('/');
            paths.pop();
            const prevPath = paths?.join('/');
            if (prevPath != null && this.pathMapping[prevPath]) {
                const data = this.pathMapping[prevPath];
                this.updatePath(data);
                this.setData({ list: data?.links ?? [], type: 'dir' });
            }
            else {
                // if (this.onClose) this.onClose();
                // this.pnlPath.clear();
                // this.pathMapping = {};
            }
            this.iconBack.visible = paths.length > 1;
        }
        onSearchClicked() {
            if (Number(this.pnlSearch.width) > 32) {
                this.inputSearch.width = '0%';
                this.pnlPath.visible = true;
                this.pnlSearch.width = '2rem';
            }
            else {
                this.pnlSearch.width = '100%';
                this.inputSearch.width = '100%';
                this.pnlPath.visible = false;
                this.inputSearch.focus();
            }
        }
        onHandleSearch() {
            if (this.searchTimer)
                clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.renderList();
            }, 500);
        }
        init() {
            this.i18n.init({ ...translations_json_1.default });
            super.init();
            this.onFetchData = this.getAttribute('onFetchData', true) || this.onFetchData;
            this.onClose = this.getAttribute('onClose', true) || this.onClose;
            this.onItemClicked = this.getAttribute('onItemClicked', true) || this.onItemClicked;
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
        }
        render() {
            return (this.$render("i-vstack", { gap: "1.25rem", width: '100%', minHeight: 'inherit', background: { color: Theme.colors.primary.main }, padding: { top: '1.25rem' } },
                this.$render("i-hstack", { verticalAlignment: 'center', horizontalAlignment: 'space-between', padding: { left: '1.25rem', right: '1.25rem' }, gap: "1rem", height: '2rem' },
                    this.$render("i-icon", { id: "iconBack", width: '1.25rem', height: '1.25rem', name: "arrow-left", fill: Theme.colors.primary.contrastText, cursor: 'pointer', onClick: this.goBack.bind(this), visible: false }),
                    this.$render("i-scom-ipfs--path", { id: "pnlPath", display: 'flex', width: '100%', isMobileView: true, onItemClicked: this.onBreadcrumbClick }),
                    this.$render("i-hstack", { id: "pnlSearch", verticalAlignment: 'center', horizontalAlignment: 'end', gap: "0.5rem", border: { radius: '0.5rem', width: '1px', style: 'solid', color: Theme.divider }, padding: { left: '0.5rem', right: '0.5rem' }, margin: { left: 'auto' }, height: '100%', width: '2rem', position: 'relative', overflow: 'hidden', class: index_css_2.transitionStyle, cursor: 'pointer', stack: { shrink: '0', grow: '1', basis: '2rem' }, background: { color: Theme.input.background } },
                        this.$render("i-input", { id: "inputSearch", height: "100%", width: '0px', background: { color: 'transparent' }, border: { style: 'none', radius: '0.5rem 0 0.5rem 0' }, onKeyUp: this.onHandleSearch, margin: { right: '2rem' } }),
                        this.$render("i-icon", { width: '2rem', height: '2rem', position: 'absolute', right: '0px', name: "search", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, stack: { grow: '0', shrink: '0' }, fill: Theme.colors.primary.contrastText, onClick: this.onSearchClicked }))),
                this.$render("i-panel", { padding: { left: '1.25rem', right: '1.25rem' }, visible: false },
                    this.$render("i-label", { id: "lblTitle", caption: '$all_folders', font: { weight: 600, size: '1.25rem', color: Theme.colors.primary.contrastText } })),
                this.$render("i-vstack", { width: '100%', border: { radius: '1.25rem 1.25rem 0 0' }, padding: { top: '1.25rem', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }, margin: { bottom: '-1px' }, background: { color: Theme.background.main }, stack: { grow: '1' } },
                    this.$render("i-hstack", { verticalAlignment: 'center', horizontalAlignment: 'space-between', gap: '0.5rem', margin: { bottom: '1rem' } },
                        this.$render("i-hstack", { verticalAlignment: 'center', horizontalAlignment: 'space-between', gap: "0.5rem", cursor: 'pointer', onClick: this.onSort },
                            this.$render("i-label", { caption: '$name', font: { size: '0.875rem', weight: 500 } }),
                            this.$render("i-icon", { id: "iconSort", name: "angle-up", width: '0.75rem', height: '0.75rem', fill: Theme.text.primary })),
                        this.$render("i-panel", { cursor: 'pointer', opacity: 0.5, hover: { opacity: 1 }, onClick: this.onChangeMode },
                            this.$render("i-icon", { id: "iconList", name: "th-large", width: '1rem', height: '1rem', fill: Theme.text.primary }))),
                    this.$render("i-grid-layout", { id: "pnlFolders", width: '100%', stack: { grow: '1' }, templateColumns: ['minmax(0, 1fr)'] }))));
        }
    };
    ScomIPFSFolder = __decorate([
        (0, components_4.customElements)('i-scom-ipfs--mobile-folder')
    ], ScomIPFSFolder);
    exports.ScomIPFSFolder = ScomIPFSFolder;
});
define("@scom/scom-storage/components/home.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomIPFSMobileHome = void 0;
    const Theme = components_5.Styles.Theme.ThemeVars;
    let ScomIPFSMobileHome = class ScomIPFSMobileHome extends components_5.Module {
        constructor(parent, options) {
            super(parent, options);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get recents() {
            return this._data?.recents ?? [];
        }
        set recents(value) {
            this._data.recents = value ?? [];
        }
        get folders() {
            return this._data?.folders ?? [];
        }
        set folders(value) {
            this._data.folders = value ?? [];
        }
        get transportEndpoint() {
            return this._transportEndpoint;
        }
        set transportEndpoint(value) {
            if (value && value !== this._transportEndpoint) {
                this._manager = new components_5.IPFS.FileManager({
                    endpoint: value,
                    signer: this._signer
                });
            }
            this._transportEndpoint = value;
        }
        get manager() {
            return this._manager;
        }
        get currentPath() {
            return this.mobileFolder.currentPath;
        }
        get currentCid() {
            return this._currentCid;
        }
        async setData(data) {
            this._data = data;
            // this.mobileMain.visible = true;
            // this.mobileFolder.visible = false;
            // this.renderRecent();
            // this.renderFolders();
            const list = [...this.folders];
            this.mobileFolder.clear();
            if (this._data.parentNode) {
                this._currentCid = data.parentNode.cid;
                this.mobileFolder.updatePath({ ...this._data.parentNode, links: list });
            }
            this.mobileFolder.setData({ list: list, type: 'dir' });
        }
        // private renderFolders() {
        //     let items = [];
        //     for (let folder of this.folders) {
        //         const isDir = folder.type === 'dir';
        //         const itemEl = (
        //             <i-vstack
        //                 verticalAlignment='center'
        //                 gap='0.5rem'
        //                 padding={{ top: '2rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
        //                 border={{ radius: '0.5rem' }}
        //                 background={{ color: Theme.divider }}
        //                 margin={{ right: '0.5rem' }}
        //                 class={backgroundStyle}
        //                 cursor="pointer"
        //                 onClick={() => this.onFolderClick(folder)}
        //             >
        //                 <i-icon
        //                     stack={{ grow: '0', shrink: '0' }}
        //                     name={isDir ? 'folder' : 'file'}
        //                     fill={isDir ? Theme.colors.warning.main : Theme.colors.info.main}
        //                     width={'1.25rem'} height={'1.25rem'}
        //                 ></i-icon>
        //                 <i-vstack gap={'0.5rem'}>
        //                     <i-label caption={folder.name} font={{ weight: 600, size: '0.875rem' }} textOverflow='ellipsis'></i-label>
        //                     <i-hstack
        //                         verticalAlignment='center'
        //                         gap={'0.5rem'}
        //                     >
        //                         <i-label caption={`${folder.links?.length || 0} files`} opacity={0.5} font={{ size: '0.675rem' }} visible={isDir}></i-label>
        //                         <i-panel width={1} height={'0.75rem'} background={{ color: Theme.divider }} visible={isDir}></i-panel>
        //                         <i-label caption={`${formatBytes(folder.size)}`} opacity={0.5} font={{ size: '0.675rem' }}></i-label>
        //                     </i-hstack>
        //                 </i-vstack>
        //             </i-vstack>
        //         )
        //         items.push({
        //             name: '',
        //             controls: [
        //                 itemEl
        //             ]
        //         })
        //     }
        //     this.foldersSlider.items = items;
        //     this.foldersSlider.activeSlide = 0;
        // }
        // private renderRecent() {
        //     this.pnlRecent.clearInnerHTML();
        //     const recentList = [...this.recents].slice(0, 3);
        //     if (recentList?.length) {
        //         for (let nodeData of recentList) {
        //             const nodeEl = (
        //                 <i-hstack
        //                     verticalAlignment='center'
        //                     gap='1.5rem'
        //                     padding={{ top: '0.5rem', bottom: '0.5rem' }}
        //                 >
        //                     <i-icon
        //                         stack={{ grow: '0', shrink: '0' }}
        //                         name={'file'}
        //                         fill={Theme.colors.info.main}
        //                         border={{ radius: '0.25rem' }}
        //                         width={'2.5rem'} height={'2.5rem'}
        //                     ></i-icon>
        //                     <i-vstack gap={'0.5rem'}>
        //                         <i-label caption={nodeData.name} font={{ weight: 600, size: '0.875rem' }} textOverflow='ellipsis'></i-label>
        //                         <i-label caption={`${formatBytes(nodeData.size)}`} opacity={0.5} font={{ size: '0.675rem' }}></i-label>
        //                     </i-vstack>
        //                 </i-hstack>
        //             )
        //             this.pnlRecent.append(nodeEl);
        //         }
        //     }
        // }
        // private async onFolderClick(data: IIPFSData) {
        //     if (data.type === 'file') return;
        //     await this.mobileFolder.handleFolderClick(data);
        //     this.mobileMain.visible = false;
        //     this.mobileFolder.visible = true;
        // }
        // private onViewFiles() {
        //     this.mobileMain.visible = false;
        //     this.mobileFolder.setData({ list: [...this.recents], type: 'file' });
        //     this.mobileFolder.visible = true;
        // }
        // private onViewFolders() {
        //     this.mobileMain.visible = false;
        //     const list = [...this.folders];
        //     if (this._data.parentNode) this.mobileFolder.updatePath({ ...this._data.parentNode, links: list });
        //     this.mobileFolder.setData({ list: list, type: 'dir' });
        //     this.mobileFolder.visible = true;
        // }
        // private onBack() {
        //     this.mobileMain.visible = true;
        //     this.mobileFolder.visible = false;
        // }
        async onFetchData(ipfsData) {
            let fileNode;
            if (ipfsData.path) {
                fileNode = await this.manager.getFileNode(ipfsData.path);
            }
            else {
                fileNode = await this.manager.getRootNode();
            }
            if (!fileNode._cidInfo.links)
                fileNode._cidInfo.links = [];
            if (fileNode._cidInfo.links.length) {
                await Promise.all(fileNode._cidInfo.links.map(async (data) => {
                    data.path = `${ipfsData.path}/${data.name}`;
                    if (!data.type) {
                        let node = await this.manager.getFileNode(data.path);
                        let isFolder = await node.isFolder();
                        data.type = isFolder ? 'dir' : 'file';
                    }
                }));
            }
            fileNode._cidInfo.path = ipfsData.path;
            return fileNode._cidInfo;
        }
        onItemClicked(data) {
            if (data.type === 'file') {
                this.onPreview(data);
            }
            else {
                this._currentCid = data.cid;
            }
        }
        init() {
            super.init();
            this.onPreview = this.onPreview.bind(this) || this.onPreview;
            const recents = this.getAttribute('recents', true);
            const folders = this.getAttribute('folders', true);
            this.transportEndpoint = this.getAttribute('transportEndpoint', true);
            this._signer = this.getAttribute('signer', true);
            this._manager = new components_5.IPFS.FileManager({
                endpoint: this.transportEndpoint,
                signer: this._signer
            });
            this.setData({ recents, folders });
        }
        render() {
            return (this.$render("i-panel", { width: '100%', minHeight: 'inherit' },
                this.$render("i-scom-ipfs--mobile-folder", { id: "mobileFolder", width: '100%', minHeight: '100%', display: 'block', 
                    // visible={false}
                    onFetchData: this.onFetchData.bind(this), onItemClicked: this.onItemClicked.bind(this) })));
        }
    };
    ScomIPFSMobileHome = __decorate([
        (0, components_5.customElements)('i-scom-ipfs--mobile-home')
    ], ScomIPFSMobileHome);
    exports.ScomIPFSMobileHome = ScomIPFSMobileHome;
});
define("@scom/scom-storage/utils.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isFileExists = exports.getNewFileName = exports.getEmbedElement = void 0;
    const getEmbedElement = async (moduleData, parent, callback) => {
        const { module, data } = moduleData;
        parent.clearInnerHTML();
        const elm = await components_6.application.createElement(module, true);
        if (!elm)
            throw new Error('not found');
        elm.parent = parent;
        const builderTarget = elm.getConfigurators ? elm.getConfigurators().find((conf) => conf.target === 'Builders') : null;
        if (elm.ready)
            await elm.ready();
        elm.maxWidth = '100%';
        elm.maxHeight = '100%';
        elm.display = 'block';
        elm.stack = { grow: '1' };
        if (builderTarget?.setData && data.properties) {
            await builderTarget.setData(data.properties);
        }
        if (builderTarget?.setTag && data.tag) {
            await builderTarget.setTag(data.tag);
        }
        if (callback)
            callback(elm);
        return elm;
    };
    exports.getEmbedElement = getEmbedElement;
    const getNewFileName = async (parentNode, fileName) => {
        const arr = fileName.split('.');
        let newName = arr.slice(0, -1).join('.');
        let ext = arr[arr.length - 1];
        while (await parentNode.findItem(`${newName}.${ext}`)) {
            const regex = /\((\d+)\)$/;
            const matches = newName.match(regex);
            if (matches) {
                const lastNumber = parseInt(matches[1]);
                const updatedString = newName.replace(/\((\d+)\)$/, '');
                newName = `${updatedString}(${lastNumber + 1})`;
            }
            else {
                newName = `${newName}(1)`;
            }
        }
        return `${newName}.${ext}`;
    };
    exports.getNewFileName = getNewFileName;
    const isFileExists = async (manager, filePath) => {
        let newFilePath;
        const arr = filePath.split('/');
        const parentPath = arr.slice(0, -1).join('/');
        const fileName = arr.slice(-1)[0];
        let fileNode;
        if (parentPath) {
            fileNode = await manager.getFileNode(parentPath);
        }
        else {
            fileNode = await manager.getRootNode();
        }
        const node = await fileNode.findItem(fileName);
        if (node) {
            let newName = await (0, exports.getNewFileName)(fileNode, fileName);
            newFilePath = `${parentPath}/${newName}`;
        }
        return { isExists: !!node, newFilePath };
    };
    exports.isFileExists = isFileExists;
});
define("@scom/scom-storage/file.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Viewer = exports.Editor = void 0;
    class Editor {
        async openFile(file, parentCid, parent, config) {
            console.log(`Opening editor for file: ${file.name}`);
        }
    }
    exports.Editor = Editor;
    class Viewer {
        async openFile(file, parentCid, parent, config) {
            console.log(`Opening viewer for file: ${file.name}`);
        }
    }
    exports.Viewer = Viewer;
});
define("@scom/scom-storage/components/loadingSpinner.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoadingSpinner = void 0;
    const Theme = components_7.Styles.Theme.ThemeVars;
    let LoadingSpinner = class LoadingSpinner extends components_7.Module {
        async init() {
            await super.init();
        }
        setProperties(value) {
            this.pnlLoadingSpinner.height = value.height || '100%';
            this.pnlLoadingSpinner.top = value.top || 0;
            this.pnlLoadingSpinner.minHeight = value.minHeight || 200;
            this.pnlLoadingSpinner.style.background = value.background || Theme.background.default;
        }
        render() {
            return (this.$render("i-vstack", { id: "pnlLoadingSpinner", width: "100%", minHeight: 200, position: "absolute", bottom: 0, zIndex: 1000, background: { color: Theme.background.main }, class: "i-loading-overlay", opacity: 0.7, mediaQueries: [
                    {
                        maxWidth: '767px',
                        properties: {
                            height: 'calc(100% - 3.125rem)',
                            top: 0
                        }
                    }
                ] },
                this.$render("i-vstack", { horizontalAlignment: "center", verticalAlignment: "center", position: "absolute", top: "calc(50% - 0.75rem)", left: "calc(50% - 0.75rem)" },
                    this.$render("i-icon", { class: "i-loading-spinner_icon", name: "spinner", width: 24, height: 24, fill: Theme.colors.primary.main }))));
        }
    };
    LoadingSpinner = __decorate([
        (0, components_7.customElements)('scom-storage--loading-spinner')
    ], LoadingSpinner);
    exports.LoadingSpinner = LoadingSpinner;
});
define("@scom/scom-storage/components/editor.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-storage/utils.ts", "@scom/scom-storage/components/index.css.ts", "@scom/scom-storage/components/loadingSpinner.tsx", "@scom/scom-storage/data.ts", "@scom/scom-storage/translations.json.ts"], function (require, exports, components_8, utils_1, index_css_3, loadingSpinner_1, data_2, translations_json_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomIPFSEditor = void 0;
    const Theme = components_8.Styles.Theme.ThemeVars;
    let ScomIPFSEditor = class ScomIPFSEditor extends components_8.Module {
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                url: '',
                type: 'md',
                isFullScreen: false
            };
            this.initialContent = '';
            this.filePath = '';
            this.onSubmit = this.onSubmit.bind(this);
            this.onCancel = this.onCancel.bind(this);
            this.onAlertConfirm = this.onAlertConfirm.bind(this);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get url() {
            return this._data.url ?? '';
        }
        set url(value) {
            this._data.url = value ?? '';
        }
        get type() {
            return this._data.type ?? 'md';
        }
        set type(value) {
            this._data.type = value ?? 'md';
        }
        get isFullScreen() {
            return this._data.isFullScreen ?? false;
        }
        set isFullScreen(value) {
            this._data.isFullScreen = value ?? false;
        }
        showLoadingSpinner() {
            if (!this.loadingSpinner) {
                this.loadingSpinner = new loadingSpinner_1.LoadingSpinner();
                this.pnlLoading.append(this.loadingSpinner);
            }
            this.pnlLoading.visible = true;
        }
        hideLoadingSpinner() {
            this.pnlLoading.visible = false;
        }
        async setData(value) {
            const isTypeChanged = this.type !== value.type;
            this._data = value;
            if (this.mdAlert)
                this.mdAlert.closeModal();
            if (this.btnSave)
                this.btnSave.enabled = false;
            this.initialContent = '';
            await this.renderUI(isTypeChanged);
        }
        async openFile(file, parentCid, parent, config) {
            parent.append(this);
            this.filePath = file.path;
            this.display = 'flex';
            this.height = '100%';
            const path = file.path.startsWith('/') ? file.path.slice(1) : file.path;
            const mediaUrl = `${config.transportEndpoint}/ipfs/${parentCid}/${path}`;
            const newType = this.getEditorType(file.name);
            const isTypeChanged = this.type !== newType;
            this._data = {
                url: mediaUrl,
                type: newType,
                isFullScreen: false,
                parentCid,
                config
            };
            this.btnActions.visible = false;
            this.renderUI(isTypeChanged);
        }
        onHide() {
            if (this.editorEl)
                this.editorEl.onHide();
        }
        getEditorType(name) {
            const ext = name.split('.').pop().toLowerCase();
            const extMap = {
                'md': 'md',
                'json': 'code'
            };
            const isWidget = this.filePath.includes('scconfig.json');
            return isWidget ? 'widget' : extMap[ext] || 'designer';
        }
        async renderUI(isTypeChanged) {
            this.showLoadingSpinner();
            const content = await (0, data_2.getFileContent)(this.url);
            if (!this.editorEl || isTypeChanged) {
                if (this.type === 'code') {
                    this.pnlEditor.clearInnerHTML();
                    this.editorEl = this.createElement('i-scom-code-editor', this.pnlEditor);
                    this.editorEl.width = '100%';
                    this.editorEl.height = '100%';
                    await this.editorEl.loadContent(content, 'json', this.filePath);
                }
                else {
                    let moduleData = this.type === 'md' ?
                        this.createEditorElement(content) :
                        this.type === 'widget' ?
                            this.createPackageBuilderElement(this._data?.config || {}) :
                            this.createDesignerElement(this.url);
                    this.editorEl = await (0, utils_1.getEmbedElement)(moduleData, this.pnlEditor);
                }
                this.initialContent = this.editorEl.value || '';
                if (this.type === 'widget') {
                    this.editorEl.onClosed = () => {
                        document.body.style.overflow = 'hidden auto';
                        if (typeof this.onClose === 'function')
                            this.onClose();
                    };
                }
                else if (this.type === 'md') {
                    this.editorEl.onChanged = this.handleEditorChanged.bind(this);
                }
                else {
                    this.editorEl.onChange = (editor) => this.handleEditorChanged(editor.value);
                }
            }
            else {
                this.initialContent = '';
                if (this.type === 'code') {
                    await this.editorEl.loadContent(content, 'json', this.filePath);
                }
                else {
                    const value = this.type === 'md' ? content : this.type === 'widget' ? '' : { url: this.url };
                    if (this.editorEl?.setValue)
                        this.editorEl.setValue(value);
                }
            }
            this.btnActions.visible = this.type !== 'widget';
            this.pnlEditor.padding = this.type === 'widget' ? { left: 0, right: 0 } : { left: '1rem', right: '1rem' };
            if (this.isFullScreen) {
                this.classList.add(index_css_3.fullScreenStyle);
                document.body.style.overflow = 'hidden';
            }
            else {
                this.classList.remove(index_css_3.fullScreenStyle);
            }
            this.hideLoadingSpinner();
        }
        handleEditorChanged(value) {
            if (this.initialContent) {
                this.btnSave.enabled = value !== this.initialContent;
            }
            else {
                this.initialContent = value;
            }
        }
        createEditorElement(value) {
            return {
                module: '@scom/scom-editor',
                data: {
                    properties: {
                        value
                    },
                    tag: {
                        width: '100%',
                        pt: 0,
                        pb: 0,
                        pl: 0,
                        pr: 0,
                    },
                },
            };
        }
        createDesignerElement(url) {
            return {
                module: '@scom/scom-designer',
                data: {
                    properties: {
                        url
                    },
                    tag: {
                        width: '100%',
                        pt: 0,
                        pb: 0,
                        pl: 0,
                        pr: 0,
                    },
                },
            };
        }
        createPackageBuilderElement(data) {
            return {
                module: '@scom/scom-widget-builder',
                data: {
                    properties: {
                        ...data
                    },
                    tag: {
                        width: '100%',
                        pt: 0,
                        pb: 0,
                        pl: 0,
                        pr: 0,
                    },
                },
            };
        }
        onCancel() {
            document.body.style.overflow = 'hidden auto';
            if (this.editorEl && 'onHide' in this.editorEl)
                this.editorEl.onHide();
            if (this.btnSave.enabled) {
                this.mdAlert.showModal();
            }
            else {
                if (this.onClose)
                    this.onClose();
            }
        }
        onSubmit() {
            document.body.style.overflow = 'hidden auto';
            if (this.onClose)
                this.onClose();
            if (this.onChanged)
                this.onChanged(this.filePath, this.editorEl.value);
        }
        onAlertConfirm() {
            if (this.onClose)
                this.onClose();
        }
        init() {
            this.i18n.init({ ...translations_json_2.default });
            super.init();
            this.onClose = this.getAttribute('onClose', true) || this.onClose;
            this.onChanged = this.getAttribute('onChanged', true) || this.onChanged;
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
        }
        render() {
            return (this.$render("i-vstack", { maxHeight: '100%', width: '100%', height: `100%`, overflow: 'hidden', gap: "0.75rem" },
                this.$render("i-hstack", { id: "btnActions", verticalAlignment: 'center', horizontalAlignment: 'end', width: '100%', stack: { shrink: '0' }, gap: "0.5rem", visible: false, padding: { left: '1rem', right: '1rem', top: '0.75rem' } },
                    this.$render("i-button", { id: "btnCancel", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, border: { radius: '0.5rem', width: '1px', style: 'solid', color: Theme.divider }, background: { color: 'transparent' }, font: { color: Theme.text.primary }, icon: { name: 'times', width: '0.875rem', height: '0.875rem', fill: Theme.text.primary }, caption: '$cancel', onClick: this.onCancel }),
                    this.$render("i-button", { id: "btnSave", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, border: { radius: '0.5rem', width: '1px', style: 'solid', color: Theme.divider }, background: { color: Theme.colors.primary.main }, font: { color: Theme.colors.primary.contrastText }, icon: { name: 'save', width: '0.875rem', height: '0.875rem', fill: Theme.colors.primary.contrastText }, caption: '$save', enabled: false, onClick: this.onSubmit })),
                this.$render("i-panel", { width: '100%', stack: { grow: '1' }, overflow: { y: 'auto', x: 'hidden' } },
                    this.$render("i-vstack", { id: "pnlLoading", visible: false }),
                    this.$render("i-vstack", { id: "pnlEditor", width: '100%', height: '100%', position: 'relative', padding: { left: '1rem', right: '1rem' }, class: index_css_3.addressPanelStyle })),
                this.$render("i-alert", { id: "mdAlert", title: '', status: 'confirm', content: '$do_you_want_to_discard_changes', onConfirm: this.onAlertConfirm, onClose: () => this.mdAlert.closeModal() })));
        }
    };
    ScomIPFSEditor = __decorate([
        (0, components_8.customElements)('i-scom-ipfs--editor')
    ], ScomIPFSEditor);
    exports.ScomIPFSEditor = ScomIPFSEditor;
});
define("@scom/scom-storage/components/preview.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-storage/components/index.css.ts", "@scom/scom-storage/data.ts", "@scom/scom-storage/utils.ts", "@scom/scom-storage/components/loadingSpinner.tsx", "@scom/scom-storage/translations.json.ts"], function (require, exports, components_9, index_css_4, data_3, utils_2, loadingSpinner_2, translations_json_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomIPFSPreview = void 0;
    const Theme = components_9.Styles.Theme.ThemeVars;
    let ScomIPFSPreview = class ScomIPFSPreview extends components_9.Module {
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                cid: '',
                name: '',
                config: {}
            };
            this.currentUrl = '';
            this.typesMapping = {
                'image': {
                    fileLimit: 5 * 1024 * 1024,
                    extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg']
                },
                'playlist': {
                    fileLimit: 100 * 1024,
                    extensions: ['m3u8']
                },
                'audio': {
                    fileLimit: 100 * 1024,
                    extensions: ['mp3', 'wav', 'ogg']
                },
                'video': {
                    fileLimit: 100 * 1024,
                    extensions: ['mp4', 'webm', 'mov']
                },
                'json': {
                    fileLimit: 5 * 1024 * 1024,
                    extensions: ['json']
                }
            };
            this.closePreview = this.closePreview.bind(this);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }
        get transportEndpoint() {
            return this._data?.config?.transportEndpoint;
        }
        set transportEndpoint(value) {
            this._data.config.transportEndpoint = value;
        }
        get parentCid() {
            return this._data?.parentCid;
        }
        set parentCid(value) {
            this._data.parentCid = value;
        }
        get previewPath() {
            return this._data?.path || '';
        }
        async openFile(file, parentCid, parent, config) {
            parent.append(this);
            this._data = {
                ...file,
                parentCid,
                config
            };
            this.renderUI(true);
        }
        showLoadingSpinner() {
            if (!this.loadingSpinner) {
                this.loadingSpinner = new loadingSpinner_2.LoadingSpinner();
                this.pnlLoading.append(this.loadingSpinner);
            }
            this.pnlLoading.visible = true;
        }
        hideLoadingSpinner() {
            this.pnlLoading.visible = false;
        }
        setData(value) {
            this.data = value;
            this.renderUI();
        }
        clear() {
            this.previewer.clearInnerHTML();
            this.lblName.caption = '';
            this.lblSize.caption = '';
            this.lblCid.caption = '';
        }
        renderUI(usePath = false) {
            this.clear();
            this.previewFile(usePath);
            this.renderFileInfo();
            if (usePath) {
                this.pnlFileInfo.visible = false;
                this.iconClose.visible = false;
            }
        }
        renderFileInfo() {
            this.lblName.caption = this._data?.name || '';
            this.lblSize.caption = (0, data_3.formatBytes)(this._data?.size || 0);
            if (this._data?.cid) {
                this.lblCid.caption = components_9.FormatUtils.truncateWalletAddress(this._data.cid);
            }
        }
        async previewFile(usePath) {
            this.pnlEdit.visible = false;
            try {
                this.showLoadingSpinner();
                const moduleData = await this.getModuleFromExtension(usePath);
                if (moduleData?.module) {
                    const elm = await (0, utils_2.getEmbedElement)(moduleData, this.previewer);
                    if (moduleData?.module === '@scom/scom-image' && usePath) {
                        elm.maxWidth = '50%';
                        elm.margin = { left: 'auto', right: 'auto' };
                    }
                }
                else if (moduleData?.data) {
                    let content = moduleData.data || '';
                    const isHTML = content.indexOf('<html') > -1;
                    if (isHTML) {
                        content = content.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
                    }
                    this.appendLabel(content);
                }
                else {
                    this.renderFilePreview();
                }
            }
            catch (error) { }
            this.hideLoadingSpinner();
        }
        getFileType(ext) {
            let result = '';
            const extensions = Object.keys(this.typesMapping);
            for (let i = 0; i < extensions.length; i++) {
                const e = extensions[i];
                if (this.typesMapping[e].extensions.includes(ext)) {
                    result = e;
                    break;
                }
            }
            return result;
        }
        async getModuleFromExtension(usePath) {
            const { cid, name, size, path, parentCid } = this._data;
            if (!cid)
                return null;
            let moduleData = null;
            const ext = (name || '').split('.').pop().toLowerCase();
            const fileType = this.getFileType(ext);
            const fileLimit = this.typesMapping[fileType]?.fileLimit || 100 * 1024;
            if (size > fileLimit)
                return null;
            let mediaUrl = `${this.transportEndpoint}/ipfs/${parentCid}/${name}`;
            if (usePath) {
                const newPath = path.startsWith('/') ? path.slice(1) : path;
                mediaUrl = `${this.transportEndpoint}/ipfs/${parentCid}/${newPath}`;
            }
            this.currentUrl = mediaUrl;
            this.pnlEdit.visible = ext === 'md' || ext === 'tsx' || ext === 'json' || path.includes('scconfig.json');
            switch (fileType) {
                case 'image':
                    moduleData = this.createImageElement(mediaUrl);
                    break;
                case 'playlist':
                    moduleData = this.createPlayerElement(mediaUrl);
                    break;
                case 'audio':
                case 'video':
                    moduleData = this.createVideoElement(mediaUrl);
                    break;
                default:
                    const result = await (0, data_3.getFileContent)(mediaUrl);
                    if (!result)
                        return null;
                    if (ext === 'md') {
                        moduleData = this.createTextElement(result);
                    }
                    else {
                        moduleData = { module: '', data: result };
                    }
                    break;
            }
            return moduleData;
        }
        appendLabel(text) {
            const vstack = this.$render("i-vstack", { gap: "0.5rem" });
            const items = text.split('\n');
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const spaces = item.match(/^\s+/);
                const spacesCount = spaces ? spaces[0].length : 0;
                const label = (this.$render("i-label", { width: '100%', overflowWrap: 'anywhere', lineHeight: 1.2, display: 'block', maxHeight: '100%', padding: { left: `${spacesCount / 4}rem` }, font: { size: '0.875rem' } }));
                label.caption = item;
                vstack.appendChild(label);
            }
            this.previewer.appendChild(vstack);
            // const hrefRegex = /https?:\/\/\S+/g
            // text = text
            //   .replace(/\n/gm, ' <br> ')
            //   .replace(/\s/g, '&nbsp;')
            //   .replace(hrefRegex, (match) => {
            //     return ` <a href="${match}" target="_blank">${match}</a> `
            //   })
        }
        renderFilePreview() {
            const wrapper = this.$render("i-panel", { width: '100%' },
                this.$render("i-hstack", { horizontalAlignment: 'center' },
                    this.$render("i-icon", { width: '3rem', height: '3rem', name: "file" })));
            this.previewer.appendChild(wrapper);
        }
        createTextElement(value) {
            return {
                module: '@scom/scom-editor',
                data: {
                    properties: {
                        value,
                        viewer: true
                    },
                    tag: {
                        width: '100%',
                        pt: 0,
                        pb: 0,
                        pl: 0,
                        pr: 0,
                    },
                },
            };
        }
        createImageElement(url) {
            return {
                module: '@scom/scom-image',
                data: {
                    properties: {
                        url: url,
                    },
                    tag: {
                        width: '100%',
                        pt: 0,
                        pb: 0,
                        pl: 0,
                        pr: 0,
                    },
                },
            };
        }
        createVideoElement(url, tag) {
            return {
                module: '@scom/scom-video',
                data: {
                    properties: {
                        url: url,
                    },
                    tag: {
                        width: '100%',
                        ...tag,
                    },
                },
            };
        }
        createPlayerElement(url, tag) {
            return {
                module: '@scom/scom-media-player',
                data: {
                    properties: {
                        url: url,
                    },
                    tag: {
                        width: '100%',
                        ...tag,
                    },
                },
            };
        }
        closePreview() {
            if (this.onClose)
                this.onClose();
        }
        async downloadFile() {
            let url = `${this.transportEndpoint}/ipfs/${this.parentCid}/${this._data.name}`;
            try {
                let response = await fetch(url);
                let blob = await response.blob();
                var objectUrl = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = objectUrl;
                a.download = this._data.name;
                a.target = '_blank';
                a.click();
            }
            catch (err) {
                console.error("download file error: ", err);
            }
            // let a = document.createElement('a');
            // a.href = `${this.transportEndpoint}/ipfs/${this._data.path}`;
            // a.download = this._data.name;
            // a.target = '_blank';
            // a.click();
        }
        async onEditClicked() {
            try {
                this.showLoadingSpinner();
                this.editorPanel.visible = true;
                this.previewerPanel.visible = false;
                if (this.onOpenEditor)
                    this.onOpenEditor();
                this.editor.filePath = this._data?.path || '';
                await this.editor.setData({
                    type: this.getEditorType(),
                    isFullScreen: true,
                    url: this.currentUrl,
                    parentCid: this.parentCid,
                    config: this._data.config
                });
            }
            catch { }
            this.hideLoadingSpinner();
        }
        getEditorType() {
            const ext = (this._data.name || '').split('.').pop().toLowerCase();
            const extMap = {
                'md': 'md',
                'json': 'code'
            };
            const isWidget = this.editor.filePath.includes('scconfig.json');
            return isWidget ? 'widget' : extMap[ext] || 'designer';
        }
        closeEditor() {
            this.editorPanel.visible = false;
            this.previewerPanel.visible = true;
            if (this.onCloseEditor)
                this.onCloseEditor();
            if (this.onClose)
                this.onClose();
        }
        onChanged(path, content) {
            if (this.onFileChanged)
                this.onFileChanged(path, content);
        }
        async onCopyCid() {
            try {
                await components_9.application.copyToClipboard(this._data.cid);
                this.imgCopy.name = "check";
                this.imgCopy.fill = Theme.colors.success.main;
                if (this.copyTimer)
                    clearTimeout(this.copyTimer);
                this.copyTimer = setTimeout(() => {
                    this.imgCopy.name = "copy";
                    this.imgCopy.fill = Theme.text.primary;
                }, 500);
            }
            catch { }
        }
        init() {
            this.i18n.init({ ...translations_json_3.default });
            super.init();
            this.onClose = this.getAttribute('onClose', true) || this.onClose;
            this.onCloseEditor = this.getAttribute('onCloseEditor', true) || this.onCloseEditor;
            this.onOpenEditor = this.getAttribute('onOpenEditor', true) || this.onOpenEditor;
            this.onFileChanged = this.getAttribute('onFileChanged', true) || this.onFileChanged;
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
        }
        render() {
            return (this.$render("i-panel", { width: '100%', height: '100%', class: index_css_4.customLinkStyle },
                this.$render("i-vstack", { id: "pnlLoading", height: '100%', width: '100%', visible: false, verticalAlignment: 'center', horizontalAlignment: 'center' }),
                this.$render("i-vstack", { id: "previewerPanel", width: '100%', height: '100%', padding: { top: '1.25rem', bottom: '1.25rem', left: '1rem', right: '1rem' } },
                    this.$render("i-hstack", { width: '100%', height: 36, stack: { shrink: '0' }, verticalAlignment: 'center', horizontalAlignment: 'space-between', border: { bottom: { width: '1px', style: 'solid', color: Theme.divider } }, mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    visible: false,
                                    maxWidth: '100%'
                                }
                            }
                        ] },
                        this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                            this.$render("i-icon", { name: "file-alt", width: '0.875rem', height: '0.875rem', stack: { shrink: '0' }, opacity: 0.7 }),
                            this.$render("i-label", { caption: "$file_preview", font: { size: '1rem' } })),
                        this.$render("i-icon", { id: "iconClose", name: "times", width: '0.875rem', height: '0.875rem', stack: { shrink: '0' }, opacity: 0.7, cursor: 'pointer', onClick: this.closePreview })),
                    this.$render("i-hstack", { id: "pnlEdit", verticalAlignment: 'center', horizontalAlignment: 'end', visible: false, padding: { top: '1rem' } },
                        this.$render("i-button", { padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, border: { radius: '0.25rem', width: '1px', style: 'solid', color: Theme.divider }, background: { color: 'transparent' }, icon: { name: 'pencil-alt', width: '1rem', height: '1rem', fill: Theme.text.primary }, onClick: this.onEditClicked })),
                    this.$render("i-hstack", { id: "pnlFileInfo", width: '100%', padding: { bottom: '1.25rem', top: '1.25rem' }, border: { bottom: { width: '1px', style: 'solid', color: Theme.divider } }, horizontalAlignment: "space-between", gap: "0.5rem" },
                        this.$render("i-vstack", { width: '100%', gap: "0.5rem" },
                            this.$render("i-label", { id: "lblName", font: { size: '1rem', weight: 600 }, wordBreak: 'break-all', lineHeight: 1.2 }),
                            this.$render("i-label", { id: "lblSize", font: { size: `0.75rem` }, opacity: 0.7 }),
                            this.$render("i-hstack", { width: "fit-content", verticalAlignment: 'center', gap: "0.5rem", cursor: 'pointer', opacity: 0.7, hover: { opacity: 1 }, onClick: this.onCopyCid },
                                this.$render("i-label", { id: "lblCid", font: { size: `0.75rem` } }),
                                this.$render("i-icon", { id: 'imgCopy', name: 'copy', width: '0.875rem', height: '0.875rem', display: 'inline-flex' }))),
                        this.$render("i-hstack", { width: 35, height: 35, border: { radius: '50%' }, horizontalAlignment: "center", verticalAlignment: "center", stack: { shrink: "0" }, cursor: "pointer", background: { color: Theme.colors.secondary.main }, hover: { backgroundColor: Theme.action.hoverBackground }, onClick: this.downloadFile },
                            this.$render("i-icon", { width: 15, height: 15, name: 'download' }))),
                    this.$render("i-vstack", { minHeight: "3rem", stack: { shrink: '1' }, overflow: { y: 'auto' }, margin: { top: '1.5rem', bottom: '1.5rem' }, gap: '1.5rem' },
                        this.$render("i-panel", { id: 'previewer', width: '100%' }))),
                this.$render("i-vstack", { id: "editorPanel", maxHeight: '100%', overflow: 'hidden', visible: false },
                    this.$render("i-scom-ipfs--editor", { id: "editor", stack: { shrink: '1', grow: '1' }, width: '100%', display: 'flex', overflow: 'hidden', onClose: this.closeEditor.bind(this), onChanged: this.onChanged.bind(this) }))));
        }
    };
    ScomIPFSPreview = __decorate([
        (0, components_9.customElements)('i-scom-ipfs--preview')
    ], ScomIPFSPreview);
    exports.ScomIPFSPreview = ScomIPFSPreview;
});
define("@scom/scom-storage/components/index.ts", ["require", "exports", "@scom/scom-storage/components/home.tsx", "@scom/scom-storage/components/path.tsx", "@scom/scom-storage/components/editor.tsx", "@scom/scom-storage/components/preview.tsx", "@scom/scom-storage/components/loadingSpinner.tsx"], function (require, exports, home_1, path_1, editor_1, preview_1, loadingSpinner_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoadingSpinner = exports.ScomIPFSPreview = exports.ScomIPFSEditor = exports.ScomIPFSPath = exports.ScomIPFSMobileHome = void 0;
    Object.defineProperty(exports, "ScomIPFSMobileHome", { enumerable: true, get: function () { return home_1.ScomIPFSMobileHome; } });
    Object.defineProperty(exports, "ScomIPFSPath", { enumerable: true, get: function () { return path_1.ScomIPFSPath; } });
    Object.defineProperty(exports, "ScomIPFSEditor", { enumerable: true, get: function () { return editor_1.ScomIPFSEditor; } });
    Object.defineProperty(exports, "ScomIPFSPreview", { enumerable: true, get: function () { return preview_1.ScomIPFSPreview; } });
    Object.defineProperty(exports, "LoadingSpinner", { enumerable: true, get: function () { return loadingSpinner_3.LoadingSpinner; } });
});
define("@scom/scom-storage/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.customMDStyles = exports.selectedRowStyle = exports.dragAreaStyle = exports.previewModalStyle = exports.iconButtonStyled = exports.defaultColors = void 0;
    const Theme = components_10.Styles.Theme.ThemeVars;
    exports.defaultColors = {
        light: {
            primaryColor: '#3f51b5',
            primaryLightColor: '#69c4cd',
            primaryDarkColor: '#0b3a53',
            secondaryColor: 'hsl(0,0%,57%)',
            borderColor: '#0000001f',
            fontColor: '#34373f',
            backgroundColor: '#fbfbfb',
            secondaryLight: '#dee2e6',
            secondaryMain: 'rgba(255, 255, 255, .15)',
            hover: '#69c4cd',
            hoverBackground: 'rgba(0, 0, 0, 0.04)',
            selected: '#fff',
            selectedBackground: '#0b3a53'
        },
        dark: {
            primaryColor: '#3f51b5',
            primaryLightColor: '#69c4cd',
            primaryDarkColor: '#0b3a53',
            secondaryColor: '#666666',
            borderColor: '#ffffff1f',
            fontColor: '#fff',
            backgroundColor: '#121212',
            secondaryLight: '#aaaaaa',
            secondaryMain: 'rgba(255, 255, 255, .15)',
            hover: '#69c4cd',
            hoverBackground: '#222222',
            selected: '#fff',
            selectedBackground: '#0b3a53'
        }
    };
    exports.default = components_10.Styles.style({
        $nest: {
            '.storage-meter-uploaded': {
                backgroundSize: '410%',
                backgroundPosition: '0% 0px',
                transition: '.25s ease-out',
                filter: 'drop-shadow(0 2px 8px rgba(33,15,85,.33))',
            },
            'i-table .i-table-cell': {
                background: Theme.background.main
            },
            '.file-manager-tree > .i-tree-node > .i-tree-node_content': {
                $nest: {
                    '.btn-folder': {
                        display: 'block !important'
                    },
                    '.btn-folder *': {
                        display: 'block !important'
                    },
                    '.btn-actions': {
                        display: 'none !important'
                    }
                }
            },
            '.file-manager-tree': {
                $nest: {
                    '.btn-folder': {
                        display: 'none !important'
                    },
                    'i-button': {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: '4px',
                        $nest: {
                            '&:hover': {
                                background: Theme.colors.primary.main
                            }
                        }
                    }
                }
            }
        }
    });
    exports.iconButtonStyled = components_10.Styles.style({
        fontSize: '0.75rem',
        justifyContent: 'start',
        padding: '4px 8px',
        $nest: {
            '&:hover': {
                background: exports.defaultColors.dark.selectedBackground,
                color: exports.defaultColors.dark.selected
            }
        }
    });
    exports.previewModalStyle = components_10.Styles.style({
        $nest: {
            '.i-modal_header': {
                padding: '1rem'
            }
        }
    });
    exports.dragAreaStyle = components_10.Styles.style({
        border: `2px solid ${Theme.colors.info.dark}`,
        opacity: 0.7
    });
    exports.selectedRowStyle = components_10.Styles.style({
        $nest: {
            '& > .i-table-cell': {
                background: `${Theme.action.focusBackground} !important`
            }
        }
    });
    exports.customMDStyles = components_10.Styles.style({
        position: 'fixed !important',
        $nest: {}
    });
});
define("@scom/scom-storage", ["require", "exports", "@ijstech/components", "@scom/scom-storage/data.ts", "@scom/scom-storage/components/index.ts", "@scom/scom-storage/file.ts", "@scom/scom-storage/index.css.ts", "@scom/scom-storage/utils.ts", "@scom/scom-upload-modal", "@scom/scom-storage/translations.json.ts"], function (require, exports, components_11, data_4, index_1, file_1, index_css_5, utils_3, scom_upload_modal_1, translations_json_4) {
    "use strict";
    var ScomStorage_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScomStorage = void 0;
    const Theme = components_11.Styles.Theme.ThemeVars;
    let ScomStorage = ScomStorage_1 = class ScomStorage extends components_11.Module {
        static getInstance() {
            if (!ScomStorage_1.instance) {
                ScomStorage_1.instance = new ScomStorage_1();
            }
            return ScomStorage_1.instance;
        }
        constructor(parent, options) {
            super(parent, options);
            this.fileEditors = new Map();
            this.currentEditor = null;
            this.tag = {
                light: {},
                dark: {}
            };
            this._data = {};
            this.filesColumns = [
                {
                    title: '',
                    fieldName: 'checkbox'
                },
                {
                    title: '$name',
                    fieldName: 'name',
                    onRenderCell: (source, columnData, rowData) => {
                        switch (rowData.type) {
                            case 'dir':
                                return (this.$render("i-hstack", { verticalAlignment: "center", gap: "0.375rem" },
                                    this.$render("i-panel", { stack: { basis: '1rem' } },
                                        this.$render("i-icon", { name: "folder", width: '0.875rem', height: '0.875rem', display: "inline-flex", fill: "#fddd35" })),
                                    this.$render("i-label", { caption: columnData, font: { size: '0.875rem' } })));
                            case 'file':
                                return (this.$render("i-hstack", { verticalAlignment: "center", gap: "0.375rem" },
                                    this.$render("i-panel", { stack: { basis: '1rem' } },
                                        this.$render("i-icon", { name: "file", width: '0.875rem', height: '0.875rem', display: "inline-flex", fill: "#298de0" })),
                                    this.$render("i-label", { caption: columnData, font: { size: '0.875rem' } })));
                            default:
                                return columnData;
                        }
                    },
                },
                {
                    title: '$type',
                    fieldName: 'type',
                    onRenderCell: (source, columnData, rowData) => {
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
                    title: '$size',
                    fieldName: 'size',
                    onRenderCell: (source, columnData, rowData) => {
                        return (0, data_4.formatBytes)(columnData);
                    },
                },
                {
                    title: '',
                    fieldName: 'blank',
                },
            ];
            this.columns = this.filesColumns.slice();
            this._uploadedTreeData = [];
            this._uploadedFileNodes = {};
            this.counter = 0;
            this._readOnly = false;
            this.isInitializing = false;
            this._isModal = false;
            this._isUploadModal = false;
            this.isUploadMultiple = true;
            this._isFileShown = false;
            this.isAssetRootNode = false;
            this.onCellDblClick = this.onCellDblClick.bind(this);
            this.registerDefaultEditors();
        }
        ;
        get baseUrl() {
            return this._baseUrl;
        }
        set baseUrl(url) {
            this._baseUrl = url;
        }
        get readOnly() {
            return this._readOnly;
        }
        ;
        set readOnly(value) {
            this._readOnly = value;
            this.btnUpload.visible = this.btnUpload.enabled = this.isUploadModal ? false : !value;
            if (this.ieSidebar) {
                this.ieSidebar.minWidth = this.readOnly ? '15rem' : '10rem';
            }
        }
        get isModal() {
            return this._isModal;
        }
        ;
        set isModal(value) {
            this._isModal = value;
        }
        get isUploadModal() {
            return this._isUploadModal;
        }
        set isUploadModal(value) {
            this._isUploadModal = value;
            if (this.pnlStorage)
                this.pnlStorage.visible = false;
        }
        get uploadMultiple() {
            return this.isUploadMultiple;
        }
        set uploadMultiple(value) {
            this.isUploadMultiple = value;
            if (this.uploadModal)
                this.uploadModal.mulitiple = value;
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
        set isFileShown(value) {
            this._isFileShown = value ?? false;
        }
        setConfig(config) {
            this._data = config;
            this._signer = config.signer;
            this.manager = new components_11.IPFS.FileManager({
                endpoint: this._data.transportEndpoint,
                signer: this._signer
            });
        }
        getConfig() {
            return this._data;
        }
        registerDefaultEditors() {
            const editor = new index_1.ScomIPFSEditor();
            this.registerEditor("md", editor);
            this.registerEditor("tsx", editor);
            this.registerEditor('json', editor);
            this.registerEditor(/(yml|yaml|js|s?css|ts)/i, new file_1.Editor());
            this.registerEditor(/(mp4|webm|mov|m3u8|jpeg|jpg|png|gif|bmp|svg)$/i, new index_1.ScomIPFSPreview());
        }
        registerEditor(fileType, editor) {
            this.fileEditors.set(fileType, editor);
        }
        async openFile(ipfsData) {
            if (!ipfsData)
                return;
            this.pnlPreview.visible = false;
            if (ipfsData.type === 'dir') {
                this.pnlCustom.visible = false;
                this.ieContent.visible = true;
                await this.onOpenFolder(ipfsData, true);
            }
            else {
                this.pnlCustom.visible = true;
                this.ieContent.visible = false;
                this.pnlCustom.clearInnerHTML();
                if (this.currentEditor && this.currentEditor instanceof index_1.ScomIPFSEditor) {
                    this.currentEditor.onHide();
                }
                const fileType = this.getFileType(ipfsData.name); // ipfsData.name.includes('scconfig.json') ? 'scconfig.json' : this.getFileType(ipfsData.name);
                const config = this.getFileConfig(ipfsData);
                if (this.fileEditors.has(fileType)) {
                    this.currentEditor = this.fileEditors.get(fileType);
                    this.currentEditor && this.currentEditor.openFile(ipfsData, this.rootCid, this.pnlCustom, config);
                }
                else {
                    const fileTypes = Array.from(this.fileEditors);
                    if (fileTypes?.length) {
                        for (const type of fileTypes) {
                            const key = type[0];
                            if (typeof key === 'string')
                                continue;
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
        getFileConfig(ipfsData) {
            let parentCid = this.rootCid;
            const parentPath = ipfsData.path.split('/').slice(0, -1).join('/');
            const parentData = this._uploadedTreeData.find((item) => item.path === parentPath);
            if (parentData?.cid)
                parentCid = parentData.cid;
            return {
                transportEndpoint: this.transportEndpoint,
                signer: this.signer,
                baseUrl: this.baseUrl,
                cid: parentCid
            };
        }
        getFileType(name) {
            return (name || '').split('.').pop().toLowerCase();
        }
        async setData(value) {
            this._data = value;
            if (this.transportEndpoint) {
                this.mobileHome.transportEndpoint = this.transportEndpoint;
            }
        }
        getData() {
            return this._data;
        }
        async onShow() {
            this.manager.reset();
            try {
                await this.manager.setRootCid('');
            }
            catch (err) { }
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
            ];
        }
        getPropertiesSchema() {
            const schema = {
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
        _getActions() {
            const propertiesSchema = this.getPropertiesSchema();
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {};
                        return {
                            execute: () => {
                                oldData = { ...this._data };
                                if (userInputData?.transportEndpoint)
                                    this._data.transportEndpoint = userInputData.transportEndpoint;
                                this.initContent();
                                if (builder?.setData)
                                    builder.setData(this._data);
                            },
                            undo: () => {
                                this._data = { ...oldData };
                                this.initContent();
                                if (builder?.setData)
                                    builder.setData(this._data);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: propertiesSchema
                }
            ];
            return actions;
        }
        getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        async setTag(value) {
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
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
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
        async getAssetRootNode() {
            let rootNode;
            try {
                rootNode = await this.manager.getRootNode();
                let node = await rootNode.findItem('_assets');
                if (node) {
                    await node.checkCid();
                    const cidInfo = node.cidInfo;
                    cidInfo.name = '_assets';
                    cidInfo.path = '/_assets';
                    rootNode = node;
                }
                this.isAssetRootNode = !!node;
            }
            catch (err) {
                console.log(err);
            }
            return rootNode;
        }
        updateUrlPath(path) {
            if (this.isModal || this.isUploadModal)
                return;
            let baseUrl = this.baseUrl ? this.baseUrl + (this.baseUrl[this.baseUrl.length - 1] == '/' ? '' : '/') : '#/';
            let url = baseUrl;
            if (this.rootCid)
                url += this.rootCid;
            if (path) {
                if (path.startsWith('/_assets'))
                    path = path.slice(8);
                url += path;
            }
            history.replaceState({}, "", url);
        }
        extractUrl() {
            let path;
            if (this.baseUrl && window.location.hash.startsWith(this.baseUrl)) {
                let length = this.baseUrl[this.baseUrl.length - 1] == '/' ? this.baseUrl.length : this.baseUrl.length + 1;
                path = window.location.hash.substring(length);
            }
            else {
                path = window.location.hash.substring(2);
            }
            let arr = path?.split('/');
            const [cid, ...paths] = arr;
            return { cid, path: paths.length ? '/' + paths.join('/') : '' };
        }
        async initContent() {
            this.pnlFooter.visible = this.isModal;
            this.btnBack.visible = this.isUploadModal || false;
            this.pnlStorage.visible = !this.isUploadModal;
            this.iconBack.visible = false;
            if (this.pnlUpload)
                this.pnlUpload.visible = this.isUploadModal || false;
            if (!this.manager || this.isInitializing)
                return;
            this.isInitializing = true;
            const { cid, path } = this.extractUrl();
            let rootNode = await this.getAssetRootNode();
            if (this.isUploadModal) {
                this.uploadModal.reset();
                if (window.matchMedia('(max-width: 767px)').matches) {
                    this.uploadModal.manager = this.mobileHome.manager;
                }
                else {
                    this.uploadModal.manager = this.manager;
                }
                this.uploadModal.show(this.isAssetRootNode ? `/_assets/uploads_${(0, components_11.moment)(new Date()).format('YYYYMMDD')}` : '');
            }
            this.rootCid = this.currentCid = rootNode?.cid;
            this.readOnly = !this.rootCid || (!this.isModal && !this.isUploadModal && (cid && cid !== this.rootCid));
            if (!this.isModal && !this.isUploadModal) {
                if (this.readOnly && cid) {
                    rootNode = await this.manager.setRootCid(cid);
                    if (rootNode)
                        this.rootCid = cid;
                }
                else if (!cid) {
                    this.updateUrlPath();
                }
            }
            const ipfsData = rootNode?.cidInfo;
            if (ipfsData) {
                this.renderUI(ipfsData, this.isAssetRootNode && !this.readOnly ? '/_assets' + path : path);
            }
            this.isInitializing = false;
        }
        async constructLinks(ipfsData, links) {
            return await Promise.all(links.map(async (data) => {
                data.path = `${ipfsData.path}/${data.name}`;
                if (!data.type) {
                    let node = await this.manager.getFileNode(data.path);
                    let isFolder = await node.isFolder();
                    data.type = isFolder ? 'dir' : 'file';
                }
                return data;
            }));
        }
        async renderUI(ipfsData, path) {
            if (!ipfsData)
                return;
            const parentNode = (({ links, ...o }) => o)(ipfsData);
            parentNode.name = parentNode.name ? parentNode.name : components_11.FormatUtils.truncateWalletAddress(parentNode.cid);
            parentNode.path = parentNode.path || '';
            parentNode.root = true;
            if (ipfsData.links?.length) {
                ipfsData.links = await this.constructLinks(parentNode, ipfsData.links);
            }
            let data = ipfsData.links ? [parentNode, ...ipfsData.links] : [parentNode];
            let tableData = ipfsData;
            this.pnlPath.clear();
            if (parentNode.name)
                this.pnlPath.setData(parentNode);
            if (path && !this.isModal && !this.isUploadModal) {
                let items = path.split('/');
                for (let i = 1; i < items.length; i++) {
                    if (!items[i])
                        continue;
                    let filePath = items.slice(0, i + 1).join('/');
                    let fileNode = await this.manager.getFileNode(filePath);
                    let isFolder = await fileNode.isFolder();
                    if (isFolder) {
                        const cidInfo = fileNode.cidInfo;
                        cidInfo.path = filePath;
                        if (!cidInfo.name)
                            cidInfo.name = fileNode.name || items[i];
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
                    }
                    else if (items.length === 2) {
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
        async renderUploadedFileTreeUI(needReset = true, path) {
            if (needReset) {
                this.uploadedFileTree.clear();
                this._uploadedFileNodes = {};
            }
            for (let nodeData of this._uploadedTreeData) {
                await this.addUploadedFileNode(nodeData, path);
            }
        }
        async addUploadedFileNode(nodeData, path) {
            const name = nodeData.name;
            let idx = '';
            let items = nodeData.path?.split('/') ?? [];
            if (this.isAssetRootNode && !this.readOnly)
                items.shift();
            let node = null;
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
                            if (nodeData.path === path)
                                node.active = true;
                            if (isActive || path?.startsWith(nodeData.path + "/"))
                                node.expanded = true;
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
                            if (nodeData.path === path)
                                node.active = true;
                        }
                    }
                    else {
                        node = self._uploadedFileNodes[idx];
                        if (node && node.tag && idx === `/${nodeData.path}`)
                            node.tag.cid = nodeData.cid;
                    }
                    if (node && nodeData.root)
                        node.expanded = true;
                }
            }
        }
        async onUpdateContent({ data, toggle }) {
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
        onUpdateBreadcumbs(node) {
            this.pnlPath.setData(node);
        }
        async onFilesUploaded(newPath) {
            const rootNode = await this.getAssetRootNode();
            const ipfsData = rootNode.cidInfo;
            let path;
            if (newPath || newPath === '') {
                path = this.isAssetRootNode && !this.readOnly ? '/_assets' + newPath : newPath;
            }
            else if (window.matchMedia('(max-width: 767px)').matches) {
                path = this.mobileHome.currentPath;
            }
            else {
                path = this.pnlPath.data.path;
            }
            if (ipfsData) {
                this.rootCid = this.currentCid = ipfsData.cid;
                this.renderUI(ipfsData, path);
                this.updateUrlPath(path);
                this.currentFile = null;
            }
        }
        handleUploadButtonClick() {
            this.onOpenUploadModal();
        }
        onOpenUploadModal(path, files) {
            if (this.readOnly || this.isUploadModal)
                return;
            if (!this.uploadModal) {
                this.uploadModal = new scom_upload_modal_1.ScomUploadModal();
                this.uploadModal.onUploaded = () => this.onFilesUploaded();
            }
            const modal = this.uploadModal.openModal({
                width: 800,
                maxWidth: '100%',
                popupPlacement: 'center',
                showBackdrop: true,
                closeOnBackdropClick: false,
                closeIcon: { name: 'times', fill: Theme.text.primary, position: 'absolute', top: '1rem', right: '1rem', zIndex: 2 },
                zIndex: 9999,
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
                ],
                class: index_css_5.customMDStyles
            });
            this.uploadModal.refresh = modal.refresh.bind(modal);
            if (window.matchMedia('(max-width: 767px)').matches) {
                if (path == null)
                    path = this.mobileHome.currentPath;
                this.uploadModal.manager = this.mobileHome.manager;
            }
            else {
                if (path == null)
                    path = this.pnlPath.data.path;
                this.uploadModal.manager = this.manager;
            }
            this.uploadModal.show(path, files);
            this.uploadModal.mulitiple = this.uploadMultiple;
            modal.refresh();
        }
        async initModalActions() {
            this.mdActions = await components_11.Modal.create({
                visible: false,
                showBackdrop: false,
                minWidth: '8rem',
                height: 'auto',
                popupPlacement: 'bottomRight'
            });
            const itemActions = new components_11.VStack(undefined, { gap: 8, border: { radius: 8 } });
            itemActions.appendChild(this.$render("i-button", { background: { color: 'transparent' }, boxShadow: "none", icon: { name: 'folder-plus', width: 12, height: 12 }, caption: "$new_folder", class: index_css_5.iconButtonStyled, onClick: () => this.onAddNewFolder() }));
            itemActions.appendChild(this.$render("i-button", { background: { color: 'transparent' }, boxShadow: "none", icon: { name: 'edit', width: 12, height: 12 }, caption: "$rename", class: index_css_5.iconButtonStyled, onClick: () => this.onRenameFolder() }));
            itemActions.appendChild(this.$render("i-button", { background: { color: 'transparent' }, boxShadow: "none", icon: { name: 'trash', width: 12, height: 12 }, caption: "$delete", class: index_css_5.iconButtonStyled, onClick: () => this.onDeleteFolder() }));
            this.mdActions.item = itemActions;
            document.body.appendChild(this.mdActions);
        }
        async onActiveChange(parent, prevNode) {
            const ipfsData = parent.activeItem?.tag;
            if (!prevNode?.isSameNode(parent.activeItem))
                this.closePreview();
            this.updateUrlPath(ipfsData.path);
            await this.openFile(ipfsData);
        }
        onActionButton(target, actionButton, event) {
            this.currentItem = target.activeItem;
            if (actionButton.tag === 'folder') {
                this.addNewFolder(true);
            }
            else {
                const ipfsData = this.currentItem?.tag;
                this.updateUrlPath(ipfsData.path);
                if (ipfsData.type === 'folder') {
                    this.onOpenFolder(ipfsData, true);
                }
                this.mdActions.parent = this.currentItem;
                const isFile = ipfsData.type === 'file';
                const firstChild = this.mdActions.item?.children[0];
                if (firstChild) {
                    firstChild.visible = !isFile;
                }
                this.mdActions.visible = true;
            }
        }
        showLoadingSpinner() {
            if (!this.loadingSpinner) {
                this.loadingSpinner = new index_1.LoadingSpinner();
                this.pnlLoading.append(this.loadingSpinner);
            }
            this.pnlLoading.visible = true;
        }
        hideLoadingSpinner() {
            this.pnlLoading.visible = false;
        }
        async getNewName(parentNode, name) {
            let newName = name;
            while (await parentNode.findItem(newName)) {
                const regex = /(\d+)$/;
                const matches = newName.match(regex);
                if (matches) {
                    const lastNumber = parseInt(matches[1]);
                    const updatedString = newName.replace(/\s\d+$/, '');
                    newName = `${updatedString} ${lastNumber + 1}`;
                }
                else {
                    newName = `${newName} 1`;
                }
            }
            return newName;
        }
        async onNameChange(target, node, oldValue, newValue) {
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
        onRenameFolder() {
            this.mdActions.visible = false;
            this.currentItem.edit();
        }
        async onDeleteFolder() {
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
        onAddNewFolder() {
            this.mdActions.visible = false;
            this.addNewFolder();
        }
        async addNewFolder(isRoot) {
            this.showLoadingSpinner();
            let fileNode;
            if (isRoot) {
                fileNode = await this.getAssetRootNode();
            }
            else {
                fileNode = await this.manager.getFileNode(this.currentItem.tag.path);
            }
            const folderName = await this.getNewName(isRoot ? fileNode : fileNode.parent, this.i18n.get('$new_folder'));
            await this.manager.addFolder(fileNode, folderName);
            await this.manager.applyUpdates();
            await this.onFilesUploaded();
            this.hideLoadingSpinner();
        }
        async onOpenFolder(ipfsData, toggle) {
            if (ipfsData) {
                this.currentCid = ipfsData.cid;
                const childrenData = await this.onFetchData(ipfsData);
                this.onUpdateContent({ data: { ...childrenData }, toggle });
                this.fileTable.data = this.processTableData({ ...childrenData });
                this.selectedRow = null;
            }
        }
        async onFetchData(ipfsData) {
            let fileNode;
            if (ipfsData.path) {
                fileNode = await this.manager.getFileNode(ipfsData.path);
            }
            else {
                fileNode = await this.getAssetRootNode();
            }
            if (!fileNode._cidInfo.links)
                fileNode._cidInfo.links = [];
            if (fileNode._cidInfo.links.length) {
                fileNode._cidInfo.links = await this.constructLinks(ipfsData, fileNode._cidInfo.links);
            }
            if (!fileNode._cidInfo.name) {
                if (ipfsData.name)
                    fileNode._cidInfo.name = ipfsData.name;
                else if (fileNode.name)
                    fileNode._cidInfo.name = fileNode.name;
            }
            fileNode._cidInfo.path = ipfsData.path;
            return fileNode._cidInfo;
        }
        processTableData(ipfsData) {
            const processedData = [];
            if (ipfsData && ipfsData.links && ipfsData.links.length) {
                const sortFn = (a, b) => a.name.localeCompare(b.name);
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
        onCellClick(target, rowIndex, columnIdx, record) {
            this.iePreview.clear();
            if (!record)
                return;
            this.updateUrlPath(record.path);
            if (record.type === 'dir') {
                this.closePreview();
                this.onOpenFolder(record, true);
            }
            else {
                this.currentFile = `${record.name}`;
                if (this.selectedRow)
                    this.selectedRow.classList.remove(index_css_5.selectedRowStyle);
                this.selectedRow = this.fileTable.querySelector(`tr[data-index="${rowIndex}"]`);
                this.selectedRow.classList.add(index_css_5.selectedRowStyle);
                this.previewFile(record);
            }
        }
        previewFile(record) {
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
                    class: index_css_5.previewModalStyle,
                    title: '$file_preview',
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
                        if (this.onClosePreview)
                            this.onClosePreview();
                    }
                });
            }
            else {
                if (!this.pnlPreview.contains(this.iePreview))
                    this.pnlPreview.appendChild(this.iePreview);
                this.pnlPreview.visible = true;
                this.btnUpload.right = '23.125rem';
            }
            if (this.onPreview)
                this.onPreview();
        }
        onCellDblClick(target, event) {
            event.stopPropagation();
            const eventTarget = event.target;
            const rowElm = eventTarget.closest('.i-table-row');
            const rowIndex = rowElm?.getAttribute('data-index') || -1;
            const rowData = target.data[rowIndex];
            if (rowData)
                this.openFile(rowData);
        }
        closePreview() {
            this.pnlPreview.visible = false;
            this.btnUpload.right = '3.125rem';
            if (this.onClosePreview)
                this.onClosePreview();
        }
        openEditor() {
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
        closeEditor() {
            this.ieSidebar.visible = true;
            this.ieSidebar.display = 'flex';
            this.ieContent.visible = true;
            this.pnlPreview.visible = false;
            this.pnlPreview.width = '20rem';
            this.pnlPreview.left = 'auto';
            this.btnUpload.visible = !this.isUploadModal;
        }
        async onSubmit(filePath, content) {
            if (filePath && content) {
                await this.manager.addFileContent(filePath, content);
                await this.manager.applyUpdates();
            }
            this.onFilesUploaded();
        }
        onBreadcrumbClick({ cid, path }) {
            if (this.uploadedFileTree.activeItem)
                this.uploadedFileTree.activeItem.expanded = true;
            this.closePreview();
            this.updateUrlPath(path);
            this.onOpenFolder({ cid, path }, false);
        }
        getDestinationFolder(event) {
            const folder = { path: '', name: '' };
            const target = event.target;
            if (target) {
                let tableColumn;
                if (target.nodeName === 'TD') {
                    tableColumn = target.childNodes?.[0];
                }
                else {
                    tableColumn = target.closest('i-table-column');
                }
                const rowData = tableColumn?.rowData;
                if (rowData?.type === 'dir') {
                    folder.path = rowData.path;
                    folder.name = rowData.name || components_11.FormatUtils.truncateWalletAddress(rowData.cid);
                }
            }
            if (!folder.path) {
                if (window.matchMedia('(max-width: 767px)').matches) {
                    folder.path = this.mobileHome.currentPath;
                }
                else {
                    folder.path = this.pnlPath.data.path;
                }
                const arr = folder.path.split('/');
                folder.name = arr[arr.length - 1] || 'root';
            }
            return folder;
        }
        handleOnDragEnter(event) {
            if (this.readOnly)
                return;
            event.preventDefault();
            this.counter++;
            this.pnlFileTable.classList.add(index_css_5.dragAreaStyle);
        }
        handleOnDragOver(event) {
            if (this.readOnly)
                return;
            event.preventDefault();
            const folder = this.getDestinationFolder(event);
            this.lblDestinationFolder.caption = folder.name || "root";
            this.pnlUploadTo.visible = true;
        }
        handleOnDragLeave(event) {
            if (this.readOnly)
                return;
            this.counter--;
            if (this.counter === 0) {
                this.pnlFileTable.classList.remove(index_css_5.dragAreaStyle);
                this.pnlUploadTo.visible = false;
            }
        }
        async handleOnDrop(event) {
            if (this.readOnly)
                return;
            event.preventDefault();
            this.counter = 0;
            this.pnlFileTable.classList.remove(index_css_5.dragAreaStyle);
            this.pnlUploadTo.visible = false;
            const folder = this.getDestinationFolder(event);
            try {
                const files = await this.getAllFileEntries(event.dataTransfer.items);
                const flattenFiles = files.reduce((acc, val) => acc.concat(val), []);
                this.onOpenUploadModal(folder.path, flattenFiles);
            }
            catch (err) {
                console.log('Error! ', err);
            }
        }
        // Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
        async readAllDirectoryEntries(directoryReader) {
            let entries = [];
            let readEntries = await this.readEntriesPromise(directoryReader);
            while (readEntries.length > 0) {
                entries.push(...readEntries);
                readEntries = await this.readEntriesPromise(directoryReader);
            }
            return entries;
        }
        // Wrap readEntries in a promise to make working with readEntries easier
        async readEntriesPromise(directoryReader) {
            try {
                return await new Promise((resolve, reject) => {
                    directoryReader.readEntries(resolve, reject);
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        async readEntryContentAsync(entry) {
            return new Promise((resolve, reject) => {
                let reading = 0;
                const contents = [];
                reading++;
                entry.file(async (file) => {
                    reading--;
                    const rawFile = file;
                    rawFile.path = entry.fullPath;
                    rawFile.cid = await components_11.IPFS.hashFile(file);
                    contents.push(rawFile);
                    if (reading === 0) {
                        resolve(contents);
                    }
                });
            });
        }
        async getAllFileEntries(dataTransferItemList) {
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
                }
                else if (entry?.isDirectory) {
                    let reader = entry.createReader();
                    queue.push(...(await this.readAllDirectoryEntries(reader)));
                }
            }
            return Promise.all(fileEntries.map((entry) => this.readEntryContentAsync(entry)));
        }
        onOpenHandler() {
            const currentCid = window.matchMedia('(max-width: 767px)').matches ? this.mobileHome.currentCid : this.currentCid;
            if (!currentCid || !this.currentFile)
                return;
            const url = `${this.transportEndpoint}/ipfs/${currentCid}/${encodeURIComponent(this.currentFile)}`;
            this.currentFile = null;
            if (this.onOpen)
                this.onOpen(url);
        }
        onCancelHandler() {
            this.currentFile = null;
            if (this.onCancel)
                this.onCancel();
        }
        renderUploadModal() {
            if (!this.uploadModal) {
                this.uploadModal = new scom_upload_modal_1.ScomUploadModal();
                this.uploadModal.onUploaded = async (target, rootCid, filePaths) => {
                    this.onFilesUploaded();
                    if (!this.uploadMultiple && filePaths.length && this.onUploadedFile) {
                        let parentCid;
                        const arr = filePaths[0].split('/');
                        const parentPath = arr.slice(0, -1).join('/');
                        const fileName = arr.slice(-1)[0];
                        if (parentPath) {
                            let fileNode = await this.manager.getFileNode(parentPath);
                            parentCid = fileNode.cid;
                        }
                        else {
                            parentCid = rootCid;
                        }
                        const url = `${this.transportEndpoint}/ipfs/${parentCid}/${encodeURIComponent(fileName)}`;
                        this.onUploadedFile(url);
                    }
                };
                this.uploadModal.onBrowseFile = () => {
                    this.pnlStorage.visible = true;
                    this.pnlUpload.visible = false;
                    this.pnlFooter.visible = true;
                    this.iconBack.visible = true;
                };
            }
            this.pnlUpload.appendChild(this.uploadModal);
            this.uploadModal.mulitiple = this.uploadMultiple;
            this.uploadModal.isBrowseButtonShown = true;
        }
        async uploadFiles(files) {
            let result = [];
            try {
                for (const file of files) {
                    let filePath = file.path;
                    const { isExists, newFilePath } = await (0, utils_3.isFileExists)(this.manager, filePath);
                    if (isExists) {
                        filePath = newFilePath;
                    }
                    const data = await this.manager.addFile(filePath, file);
                    result.push({
                        fileName: file.name,
                        path: data.file.name
                    });
                }
                await this.manager.applyUpdates();
                const rootNode = await this.manager.getRootNode();
                const path = `${this.transportEndpoint}/ipfs/${rootNode.cid}`;
                result = result.map(v => {
                    return {
                        ...v,
                        path: `${path}/${v.path}`
                    };
                });
            }
            catch (error) {
                console.log('uploadFiles', error);
            }
            return result;
        }
        handleBack() {
            if (!this.isUploadModal)
                return;
            this.pnlStorage.visible = false;
            this.pnlFooter.visible = false;
            this.uploadModal.reset();
            this.pnlUpload.visible = true;
            this.iconBack.visible = false;
        }
        init() {
            this.i18n.init({ ...translations_json_4.default });
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
            this.classList.add(index_css_5.default);
            this.setTag(index_css_5.defaultColors);
            this.manager = new components_11.IPFS.FileManager({
                endpoint: transportEndpoint,
                signer: signer
            });
            if (transportEndpoint)
                this.setData({ transportEndpoint, signer, isModal: this.isModal, isUploadModal: this.isUploadModal });
            this.handleOnDragEnter = this.handleOnDragEnter.bind(this);
            this.handleOnDragOver = this.handleOnDragOver.bind(this);
            this.handleOnDragLeave = this.handleOnDragLeave.bind(this);
            this.handleOnDrop = this.handleOnDrop.bind(this);
            this.pnlFileTable.addEventListener('dragenter', this.handleOnDragEnter);
            this.pnlFileTable.addEventListener('dragover', this.handleOnDragOver);
            this.pnlFileTable.addEventListener('dragleave', this.handleOnDragLeave);
            this.pnlFileTable.addEventListener('drop', this.handleOnDrop);
            this.initModalActions();
            this.fileTable.updateLocale(this.i18n);
        }
        render() {
            return (this.$render("i-vstack", { width: '100%', height: '100%', overflow: 'hidden' },
                this.$render("i-icon", { id: "iconBack", width: "1rem", height: "1rem", position: "absolute", name: "arrow-left", top: 10, zIndex: 1, cursor: "pointer", visible: false, onClick: this.handleBack }),
                this.$render("i-panel", { id: "pnlUpload", visible: false, overflow: { y: 'auto' } }),
                this.$render("i-panel", { id: "pnlStorage", height: '100%', width: '100%', stack: { grow: '1' }, overflow: { y: 'auto' } },
                    this.$render("i-vstack", { id: "pnlLoading", visible: false }),
                    this.$render("i-scom-ipfs--mobile-home", { id: "mobileHome", width: '100%', minHeight: '100vh', display: 'block', background: { color: Theme.background.main }, onPreview: this.previewFile.bind(this), transportEndpoint: this.transportEndpoint, signer: this.signer, visible: false, mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    visible: true
                                }
                            }
                        ] }),
                    this.$render("i-vstack", { height: '100%', width: '100%', overflow: 'hidden', maxHeight: '100vh', background: { color: Theme.background.main }, mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    visible: false,
                                    maxWidth: '100%'
                                }
                            }
                        ] },
                        this.$render("i-panel", { stack: { grow: '1', basis: '0%' }, overflow: 'hidden' },
                            this.$render("i-grid-layout", { id: 'gridWrapper', height: '100%', width: '100%', overflow: 'hidden', position: 'relative', templateColumns: ['15rem', '1fr'], background: { color: Theme.background.main } },
                                this.$render("i-vstack", { id: 'ieSidebar', resizer: true, dock: "left", height: '100%', overflow: { y: 'auto', x: 'hidden' }, minWidth: '10rem', width: '15rem', border: { right: { width: '1px', style: 'solid', color: Theme.divider } } },
                                    this.$render("i-tree-view", { id: "uploadedFileTree", class: "file-manager-tree uploaded", stack: { grow: '1' }, maxHeight: '100%', overflow: 'auto', editable: true, actionButtons: [
                                            {
                                                icon: { name: 'ellipsis-h', width: 14, height: 14, display: 'inline-flex' },
                                                tag: 'actions',
                                                class: 'btn-actions'
                                            },
                                            {
                                                icon: { name: 'folder-plus', width: 14, height: 14, display: 'inline-flex' },
                                                tag: 'folder',
                                                class: 'btn-folder'
                                            }
                                        ], onActionButtonClick: this.onActionButton, onActiveChange: this.onActiveChange, onChange: this.onNameChange })),
                                this.$render("i-vstack", { id: 'ieContent', dock: 'fill', height: '100%', overflow: { y: 'auto' } },
                                    this.$render("i-scom-ipfs--path", { id: "pnlPath", display: 'flex', width: '100%', padding: { left: '1rem', right: '1rem' }, onItemClicked: this.onBreadcrumbClick }),
                                    this.$render("i-panel", { width: '100%', height: 'auto', stack: { grow: "1" }, position: "relative", border: {
                                            top: { width: '0.0625rem', style: 'solid', color: Theme.colors.primary.contrastText }
                                        } },
                                        this.$render("i-panel", { id: "pnlFileTable", height: "100%" },
                                            this.$render("i-table", { id: "fileTable", heading: true, columns: this.columns, headingStyles: {
                                                    font: { size: '0.75rem', weight: 700, color: Theme.text.primary },
                                                    padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' },
                                                    height: '2rem',
                                                    background: { color: '#f8f9fa' }
                                                }, bodyStyles: {
                                                    font: { size: '0.75rem', color: Theme.text.primary },
                                                    padding: { top: '0.375rem', bottom: '0.375rem', left: '0.5rem', right: '0.5rem' },
                                                    height: '2.25rem',
                                                    cursor: 'pointer'
                                                }, onCellClick: this.onCellClick, onDblClick: this.onCellDblClick })),
                                        this.$render("i-panel", { id: "pnlUploadTo", width: "fit-content", class: "text-center", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, margin: { left: 'auto', right: 'auto' }, border: { radius: 6 }, background: { color: '#0288d1' }, lineHeight: 1.5, position: "absolute", bottom: "1.5rem", left: 0, right: 0, visible: false },
                                            this.$render("i-label", { caption: "$upload_files_to", font: { size: '15px', color: '#fff' } }),
                                            this.$render("i-hstack", { horizontalAlignment: "center", verticalAlignment: "center", gap: "0.375rem" },
                                                this.$render("i-icon", { name: "folder", width: '0.875rem', height: '0.875rem', display: "inline-flex", fill: '#fff' }),
                                                this.$render("i-label", { id: "lblDestinationFolder", font: { size: '15px', color: '#fff' } }))))),
                                this.$render("i-vstack", { id: "pnlCustom", visible: false, dock: 'fill', height: '100%', overflow: { y: 'auto' } }),
                                this.$render("i-panel", { id: "pnlPreview", border: { left: { width: '1px', style: 'solid', color: Theme.divider } }, width: '20rem', dock: 'right', visible: false },
                                    this.$render("i-scom-ipfs--preview", { id: "iePreview", width: '100%', height: '100%', display: 'block', onClose: this.closePreview.bind(this), onOpenEditor: this.openEditor.bind(this), onCloseEditor: this.closeEditor.bind(this), onFileChanged: this.onSubmit.bind(this) }))))),
                    this.$render("i-button", { id: "btnUpload", boxShadow: '0 10px 25px -5px rgba(44, 179, 240, 0.6)', border: { radius: '50%' }, background: { color: Theme.colors.primary.light }, lineHeight: '3.375rem', width: '3.375rem', height: '3.375rem', icon: { name: 'plus', width: '1.125rem', height: ' 1.125rem', fill: Theme.colors.primary.contrastText }, position: 'absolute', bottom: '3.125rem', right: '3.125rem', zIndex: 100, onClick: this.handleUploadButtonClick, mediaQueries: [
                            {
                                maxWidth: '767px',
                                properties: {
                                    position: 'fixed',
                                    bottom: '4rem',
                                    right: '1.25rem'
                                }
                            }
                        ] })),
                this.$render("i-hstack", { id: "pnlFooter", horizontalAlignment: 'end', gap: "0.75rem", stack: { shrink: '0' }, padding: { top: '1rem', bottom: '1rem' }, visible: false },
                    this.$render("i-button", { id: "btnSubmit", height: '2.25rem', padding: { left: '1rem', right: '1rem' }, background: { color: Theme.colors.primary.main }, font: { color: Theme.colors.primary.contrastText, bold: true, size: '1rem' }, border: { radius: '0.25rem' }, caption: "$select", onClick: this.onOpenHandler }),
                    this.$render("i-button", { id: "btnBack", height: '2.25rem', padding: { left: '1rem', right: '1rem' }, background: { color: 'transparent' }, font: { color: Theme.colors.primary.main, bold: true, size: '1rem' }, border: { width: 1, style: 'solid', color: Theme.colors.primary.main, radius: '0.25rem' }, caption: "$back_to_upload", visible: false, onClick: this.handleBack }),
                    this.$render("i-button", { id: "btnCancel", height: '2.25rem', padding: { left: '1rem', right: '1rem' }, background: { color: 'transparent' }, font: { color: Theme.colors.primary.main, bold: true, size: '1rem' }, border: { radius: '0.25rem' }, caption: "$cancel", onClick: this.onCancelHandler }))));
        }
    };
    ScomStorage = ScomStorage_1 = __decorate([
        (0, components_11.customElements)('i-scom-storage')
    ], ScomStorage);
    exports.ScomStorage = ScomStorage;
});
