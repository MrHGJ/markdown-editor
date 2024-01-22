import React from 'react'
import IconBold from '@/assets/imgs/markdown/icon-bold.png'
import IconDelete from '@/assets/imgs/markdown/icon-delete.png'
import IconDivider from '@/assets/imgs/markdown/icon-divider.png'
import IconH1 from '@/assets/imgs/markdown/icon-h1.png'
import IconH2 from '@/assets/imgs/markdown/icon-h2.png'
import IconH3 from '@/assets/imgs/markdown/icon-h3.png'
import IconItalics from '@/assets/imgs/markdown/icon-italics.png'
import IconLink from '@/assets/imgs/markdown/icon-link.png'
import IconPhoto from '@/assets/imgs/markdown/icon-photo.png'
import IconUl from '@/assets/imgs/markdown/icon-ul.png'
import IconTable from '@/assets/imgs/markdown/icon-table.png'
import './index.scss'
import { resetRange } from '../tools'

export const ToolBar = (props: any) => {
  const { editorRef, editorRange } = props
  // 插入内容
  const autoInsert = (content: string) => {
    // 输入框聚焦
    editorRef?.current?.focus()
    // 光标定位到失焦前
    resetRange(editorRange?.current?.range)
    // 插入文本内容
    document.execCommand('insertHTML', false, content)
  }

  const autoInsert2 = (content: string, optionType: string) => {
    // 输入框聚焦
    editorRef?.current?.focus()
    const range = editorRange?.current?.range
    // 光标定位到失焦前
    resetRange(range)
    if (
      !(
        range?.commonAncestorContainer?.data &&
        range.commonAncestorContainer.data.length > 0 &&
        range?.endOffset > range?.startOffset
      )
    ) {
      document.execCommand('insertHTML', false, content)
      return
    }
    const selectContent = range?.commonAncestorContainer.data.slice(
      range.startOffset,
      range.endOffset,
    )
    let insertContent = content
    if (optionType === 'h1') {
      insertContent = `\n# ${selectContent}\n`
    }
    if (optionType === 'h2') {
      insertContent = `\n## ${selectContent}\n`
    }
    if (optionType === 'h3') {
      insertContent = `\n### ${selectContent}\n`
    }
    if (optionType === 'bold') {
      insertContent = `**${selectContent}**`
    }
    if (optionType === 'italic') {
      insertContent = `*${selectContent}*`
    }
    if (optionType === 'delete') {
      insertContent = `~~${selectContent}~~`
    }
    if (optionType === 'link') {
      insertContent = `[链接描述](${selectContent})`
    }
    document.execCommand('insertHTML', false, insertContent)
  }
  return (
    <div className='toolbar'>
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('# 标题', 'h1')
        }}
      >
        <img src={IconH1} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('## 标题', 'h2')
        }}
      >
        <img src={IconH2} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('### 标题', 'h3')
        }}
      >
        <img src={IconH3} className='toolbar__menu__icon' />
      </div>
      <div className='vertical-divider' />
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('* ', 'ul')
        }}
      >
        <img src={IconUl} className='toolbar__menu__icon' />
      </div>
      <div className='vertical-divider' />
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert('\n***\n')
        }}
      >
        <img src={IconDivider} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={(e) => {
          autoInsert2('**加粗**', 'bold')
        }}
      >
        <img src={IconBold} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('*斜体*', 'italic')
        }}
      >
        <img src={IconItalics} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('~~删除线~~', 'delete')
        }}
      >
        <img src={IconDelete} className='toolbar__menu__icon' />
      </div>
      <div className='vertical-divider' />
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2('[链接描述](https://xxx)', 'link')
        }}
      >
        <img src={IconLink} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={() => {
          autoInsert2(
            `| 左对齐 | 居中对齐 | 右对齐 |\n| :-----| :----: | ----: |\n| 单元格 | 单元格 | 单元格 |\n| 单元格 | 单元格 | 单元格 |\n| 单元格 | 单元格 | 单元格 |`,
            'ul',
          )
        }}
      >
        <img src={IconTable} className='toolbar__menu__icon' />
      </div>
      <div
        className='toolbar__menu'
        onClick={() => {
          // uploadImageClick()
          autoInsert2('![图片描述](https://xxx)', 'link')
        }}
      >
        <img src={IconPhoto} className='toolbar__menu__icon' />
      </div>
    </div>
  )
}
