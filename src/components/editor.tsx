import {
  Button,
  Container,
  ControlElement,
  customElements,
  Module,
  Panel,
  Styles,
  Alert,
  Control,
  VStack
} from '@ijstech/components'
import { getEmbedElement } from '../utils';
import { addressPanelStyle, fullScreenStyle } from './index.css';
import { IFileHandler } from '../file';
import { EditorType, IEditor, IIPFSData, IStorageConfig } from '../interface';
import { LoadingSpinner } from './loadingSpinner';
import { getFileContent } from '../data';
import { ScomIPFSCodeEditor } from './codeEditor';
const Theme = Styles.Theme.ThemeVars

type onChangedCallback = (filePath?: string, content?: string) => void

interface ScomIPFSEditorElement extends ControlElement {
  data?: IEditor;
  onClose?: () => void
  onChanged?: onChangedCallback
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-ipfs--editor']: ScomIPFSEditorElement
    }
  }
}

@customElements('i-scom-ipfs--editor')
export class ScomIPFSEditor extends Module implements IFileHandler {
  private pnlEditor: Panel;
  private editorEl: any;
  private btnSave: Button;
  private mdAlert: Alert;
  private btnActions: Panel;
  private loadingSpinner: LoadingSpinner;
  private pnlLoading: VStack;

  private _data: IEditor = {
    url: '',
    type: 'md',
    isFullScreen: false
  };
  private initialContent: string = '';
  filePath: string = '';
  onClose: () => void
  onChanged: onChangedCallback

  constructor(parent?: Container, options?: any) {
    super(parent, options)
    this.onSubmit = this.onSubmit.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onAlertConfirm = this.onAlertConfirm.bind(this)
  }

  static async create(options?: ScomIPFSEditorElement, parent?: Container) {
    let self = new this(parent, options)
    await self.ready()
    return self
  }

  get url() {
    return this._data.url ?? ''
  }
  set url(value: string) {
    this._data.url = value ?? ''
  }

  get type() {
    return this._data.type ?? 'md'
  }
  set type(value: EditorType) {
    this._data.type = value ?? 'md'
  }

  get isFullScreen() {
    return this._data.isFullScreen ?? false
  }
  set isFullScreen(value: boolean) {
    this._data.isFullScreen = value ?? false
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

  async setData(value: IEditor) {
    const isTypeChanged = this.type !== value.type;
    this._data = value
    if (this.mdAlert) this.mdAlert.closeModal();
    if (this.btnSave) this.btnSave.enabled = false;
    this.initialContent = '';
    await this.renderUI(isTypeChanged)
  }

  async openFile(file: IIPFSData, parentCid: string, parent: Control, config: IStorageConfig) {
    parent.append(this);
    this.filePath = file.path
    this.display = 'flex'
    this.height = '100%'
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
    }
    this.btnActions.visible = false;
    this.renderUI(isTypeChanged)
  }

  onHide(): void {
    if (this.editorEl) this.editorEl.onHide();
  }

  private getEditorType(name: string) {
    const ext = name.split('.').pop().toLowerCase();
    const extMap = {
      'md': 'md',
      'json': 'code'
    }
    const isWidget = this.filePath.includes('scconfig.json');
    return isWidget ? 'widget' : extMap[ext] || 'designer';
  }

  private async renderUI(isTypeChanged?: boolean) {
    this.showLoadingSpinner();
    const content = await getFileContent(this.url);
    if (!this.editorEl || isTypeChanged) {
      if (this.type === 'code') {
        this.pnlEditor.clearInnerHTML();
        this.editorEl = this.createElement('i-scom-ipfs--code-editor', this.pnlEditor) as ScomIPFSCodeEditor;
        this.editorEl.width = '100%';
        this.editorEl.height = '100%';
        await this.editorEl.setData({ content, url: this.url, path: this.filePath });
      } else {
        let moduleData = this.type === 'md' ?
        this.createEditorElement(content) :
        this.type === 'widget' ?
          this.createPackageBuilderElement(this._data?.config || {}) :
          this.createDesignerElement(this.url);
        this.editorEl = await getEmbedElement(moduleData, this.pnlEditor);
      }

      this.initialContent = this.editorEl.value || '';

      if (this.type === 'widget') {
        this.editorEl.onClosed = () => {
          document.body.style.overflow = 'hidden auto';
          if (typeof this.onClose === 'function') this.onClose();
        }
      } else if (this.type === 'md') {
        this.editorEl.onChanged = this.handleEditorChanged.bind(this);
      } else {
        this.editorEl.onChange = (editor: any) => this.handleEditorChanged(editor.value);
      }
    } else {
      this.initialContent = '';
      if (this.type === 'code') {
        await this.editorEl.setData({ content, url: this.url, path: this.filePath });
      } else {
        const value = this.type === 'md' ? content : this.type === 'widget' ? '' : { url: this.url };
        if(this.editorEl?.setValue) this.editorEl.setValue(value);
      }
    }
    this.btnActions.visible = this.type !== 'widget';
    this.pnlEditor.padding = this.type === 'widget' ? {left: 0, right: 0} : {left: '1rem', right: '1rem'};
    if (this.isFullScreen) {
      this.classList.add(fullScreenStyle);
      document.body.style.overflow = 'hidden';
    } else {
      this.classList.remove(fullScreenStyle);
    }
    this.hideLoadingSpinner();
  }

  private handleEditorChanged(value: string) {
    if (this.initialContent) {
      this.btnSave.enabled = value !== this.initialContent;
    } else {
      this.initialContent = value;
    }
  }

  private createEditorElement(value: string) {
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
    }
  }

  private createDesignerElement(url: string) {
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
    }
  }

  private createPackageBuilderElement(data: any) {
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
    }
  }

  private onCancel() {
    document.body.style.overflow = 'hidden auto';
    if (this.editorEl) this.editorEl.onHide();
    if (this.btnSave.enabled) {
      this.mdAlert.showModal()
    } else {
      if (this.onClose) this.onClose()
    } 
  }

  private onSubmit() {
    document.body.style.overflow = 'hidden auto';
    if (this.onClose) this.onClose()
    if (this.onChanged) this.onChanged(this.filePath, this.editorEl.value)
  }

  private onAlertConfirm() {
    if (this.onClose) this.onClose()
  }

  init() {
    super.init()
    this.onClose = this.getAttribute('onClose', true) || this.onClose
    this.onChanged = this.getAttribute('onChanged', true) || this.onChanged
    const data = this.getAttribute('data', true)
    if (data) this.setData(data)
  }

  render() {
    return (
      <i-vstack
        maxHeight={'100%'}
        width={'100%'} height={`100%`}
        overflow={'hidden'}
        gap="0.75rem"
      >
        <i-hstack
          id="btnActions"
          verticalAlignment='center'
          horizontalAlignment='end'
          width={'100%'}
          stack={{shrink: '0'}}
          gap="0.5rem"
          visible={false}
          padding={{ left: '1rem', right: '1rem', top: '0.75rem' }}
        >
          <i-button
            id="btnCancel"
            padding={{top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem'}}
            border={{radius: '0.5rem', width: '1px', style: 'solid', color: Theme.divider}}
            background={{color: 'transparent'}}
            font={{color: Theme.text.primary}}
            icon={{name: 'times', width: '0.875rem', height: '0.875rem', fill: Theme.text.primary}}
            caption='Cancel'
            onClick={this.onCancel}
          ></i-button>
           <i-button
            id="btnSave"
            padding={{top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem'}}
            border={{radius: '0.5rem', width: '1px', style: 'solid', color: Theme.divider}}
            background={{color: Theme.colors.primary.main}}
            font={{color: Theme.colors.primary.contrastText}}
            icon={{name: 'save', width: '0.875rem', height: '0.875rem', fill: Theme.colors.primary.contrastText}}
            caption='Save'
            enabled={false}
            onClick={this.onSubmit}
          ></i-button>
        </i-hstack>
        <i-panel width={'100%'} stack={{grow: '1'}} overflow={{y: 'auto', x: 'hidden'}}>
          <i-vstack id="pnlLoading" visible={false} />
          <i-vstack
            id="pnlEditor"
            width={'100%'} height={'100%'}
            position='relative'
            padding={{ left: '1rem', right: '1rem' }}
            class={addressPanelStyle}
          ></i-vstack>
        </i-panel>
        <i-alert
          id="mdAlert"
          title=''
          status='confirm'
          content='Do you want to discard changes?'
          onConfirm={this.onAlertConfirm}
          onClose={() => this.mdAlert.closeModal()}
        ></i-alert>
      </i-vstack>
    )
  }
}
