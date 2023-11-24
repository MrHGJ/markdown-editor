/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-children-prop */
import React, { useCallback, useMemo, useState } from 'react'
import cx from 'classnames'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import breaks from 'remark-breaks'
import { IMention } from '../at-mentions-editor/types'
import { MentionItem } from './mention-item'
import './index.scss'
const prefix = 'markdown-preview'

interface IMarkdownViewProps {
  className?: string
  style?: React.CSSProperties
  children: string
  mentions?: IMention[]
}

const MarkdownPreview = (props: IMarkdownViewProps) => {
  const { className, children, mentions = [] } = props
  const [showImgPreview, setShowImgPreview] = useState(false)
  const [curImgSrc, setCurImgSrc] = useState('')

  // 字符串插入
  const insertStr = (soure: string, position: number, newStr: string, cutOff = 0) => {
    return soure.slice(0, position) + newStr + soure.slice(position + cutOff)
  }

  // 处理@数据，添加<at>XXX</at>标记
  // 「test@张三 test」   =>    「test<at>{userId:'zhangsan',userName:'张三'...}</at> test」
  const formatAt = useCallback((pureString: string, atList: IMention[]) => {
    let resultStr: string = pureString
    const sortedAtList = atList.sort((a, b) => {
      return a.offset - b.offset
    })
    if (sortedAtList && sortedAtList.length > 0) {
      for (let i = sortedAtList.length - 1; i >= 0; i--) {
        const { offset, length } = sortedAtList[i]
        const atDataStr = JSON.stringify(sortedAtList[i])
        // 先插尾再插头
        resultStr = insertStr(resultStr, offset + length, '</myat>')
        resultStr = insertStr(resultStr, offset, `<myat>${atDataStr}`, length)
      }
    }
    return resultStr
  }, [])

  // 处理链接
  const formatLinks = useCallback((text: string) => {
    if (!text) return ''
    const links = text.match(
      /((https?):\/\/)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g,
    )
    links?.forEach((link) => {
      text = insertStr(text, text.indexOf(link) + link.length, ' ')
    })
    return text
  }, [])

  // 处理信号灯🔴🟢🟡
  const formatLight = useCallback((text: string) => {
    text = text.replace(/\[r\]/g, '<mylight>red</mylight> ')
    text = text.replace(/\[g\]/g, '<mylight>green</mylight> ')
    text = text.replace(/\[y\]/g, '<mylight>yellow</mylight> ')
    return text
  }, [])

  // 手动处理换行
  const formatBr = useCallback((text: string) => {
    // 手动处理有序列表问题
    text = text.replace(/([0-9]+\.'')(.*)(\n)/g, ($0, $1, $2, $3) => {
      return $1 + $2 + '<mybr>0</mybr>' + $3
    })
    // 手动处理无序列表问题
    text = text.replace(/([*+-]'')(.*)(\n)/g, ($0, $1, $2, $3) => {
      return $1 + $2 + '<mybr>0</mybr>' + $3
    })

    for (let i = text.length - 1; i >= 1; i--) {
      if (text[i] === '\n' && text[i - 1] === '\n') {
        const start = i
        let end = i
        for (let j = i - 1; text[j] === '\n'; j--) {
          end = j
        }
        text = insertStr(text, end, `<mybr>${start - end}</mybr>`, start - end)
      }
    }
    text = text.replace(/<mybr>/g, '\n\n<mybr>')
    text = text.replace(/<\/mybr>/g, '</mybr>\n\n')

    // 处理四个以上空格变成代码格式
    text = text.replace(/(\n)(\s{3})(\s+)/g, ($0, $1, $2) => {
      return $1 + $2
    })
    return text
  }, [])

  // 处理分割线。 换行处理后需要让分割线展示出来。
  const formatDivider = useCallback((text: string) => {
    text = text.replace(/\n---/g, '\n\n---')
    text = text.replace(/\n\*\*\*/g, '\n\n***')
    return text
  }, [])

  // 兼容列表紧跟表格、表格不渲染的问题
  const dealTable = useCallback((text: string) => {
    const lines = text.split('\n')
    // 在每个表格头部和尾部插入 <mybr>0</mybr>
    let preLineIsTable = false
    const modifiedLines = lines.map((line, index) => {
      let newLine = line
      const nextLineIsTable =
        index === lines.length - 1 ? false : lines[index + 1].trim().startsWith('|')
      if (line.trim().startsWith('|')) {
        if (!preLineIsTable) {
          newLine = '\n<mybr>0</mybr>\n' + line
        }
        if (!nextLineIsTable) {
          newLine = line + '\n\n<mybr>0</mybr>\n'
        }
        preLineIsTable = true
      } else {
        preLineIsTable = false
      }
      return newLine
    })
    text = modifiedLines.join('\n')
    return text
  }, [])

  // 兼容处理
  const dealCompatible = useCallback((text: string) => {
    // 处理加粗 ** xxx **
    text = text.replace(/\*\* *(.*?) *\*\*/g, '**$1**')
    // 处理待办列表 [ ] xxx
    text = text.replace(/([*-] *)?\[( |x)\]/g, function (match, p1, p2) {
      if (p1 === undefined) {
        return `* [${p2}] `
      } else {
        return `${match} `
      }
    })
    // 处理标题间没空格 #xxxx
    text = text.replace(/^(#{1,6}) ?(.+)/gm, '$1 $2')
    return text
  }, [])

  const markdownData = useMemo(() => {
    let resultData: string = children
    resultData = formatAt(children, mentions)
    resultData = formatLinks(resultData)
    resultData = formatLight(resultData)
    resultData = formatBr(resultData)
    resultData = formatDivider(resultData)
    resultData = dealTable(resultData)
    resultData = dealCompatible(resultData)
    return resultData
  }, [
    children,
    formatAt,
    mentions,
    formatLinks,
    formatLight,
    formatBr,
    formatDivider,
    dealTable,
    dealCompatible,
  ])

  const renderMyAt = useCallback(({ children: atData }) => {
    const atInfo = JSON.parse(atData)
    return <MentionItem userId={atInfo?.userId} userName={atInfo?.userName} />
  }, [])

  const renderMyBr = useCallback(
    ({ children: count }) => <div style={{ height: `${20 * Number(count)}px` }}></div>,
    [],
  )

  // 信号灯  🔴 🟢 🟡
  const renderMyLight = useCallback(
    ({ children: curColor }) => (
      <div
        className={cx(`${prefix}__light`, {
          [`${prefix}__light__red`]: curColor.toString() === 'red',
          [`${prefix}__light__green`]: curColor.toString() === 'green',
          [`${prefix}__light__yellow`]: curColor.toString() === 'yellow',
        })}
      />
    ),
    [],
  )

  const renderMyOl = useCallback((props) => {
    const { children: olChildren, start, ...rest } = props
    // 有序列表注入isOrder和sort，分别代表有序和排列的数字，用于区分无序列表
    const insertSort = (children: React.ReactChildren) => {
      let counter = start || 1
      return React.Children.map(children, (child) => {
        if (child.toString() !== '\n') {
          return React.cloneElement(child as any, {
            isOrder: true,
            sort: counter++,
          })
        } else {
          return null
        }
      })
    }
    return <ol {...rest}>{insertSort(olChildren)}</ol>
  }, [])

  const renderMyLi = useCallback((props) => {
    const { children: liChildren, isOrder = false, sort = 1, checked } = props
    const isToDoList = checked !== null
    return (
      <div className={`${prefix}__li`}>
        {!isToDoList && (
          <div className={cx(`${prefix}__li__left`, { [`${prefix}__li__left__dot`]: !isOrder })}>
            {isOrder ? `${sort}.` : ''}
          </div>
        )}
        <div className={`${prefix}__li__right`}>{liChildren}</div>
      </div>
    )
  }, [])

  const renderMyInput = useCallback((props) => {
    const { checked } = props
    return (
      <span className={cx(`${prefix}__input-icon`, checked && `${prefix}__input-icon--checked`)} />
    )
  }, [])

  const renderMyHr = useCallback(() => <div className={`${prefix}__hr`} />, [])

  const renderMyImg = useCallback((props) => {
    const { src, alt } = props
    return (
      <img
        className={`${prefix}__image`}
        src={src}
        alt={alt}
        onClick={() => {
          setShowImgPreview(true)
          setCurImgSrc(src)
        }}
      />
    )
  }, [])

  const renderMyLink = useCallback((props) => {
    const { href, children } = props
    return (
      <a
        style={{ wordBreak: 'break-all' }}
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e) => {
          const larkFileUrl = 'xiaomi.f.mioffice.cn'
          const isLarkLink = href.includes(larkFileUrl)
        }}
      >
        {children}
      </a>
    )
  }, [])

  const renderMyBlockquote = useCallback((props) => {
    const { node, ...rest } = props
    return (
      <blockquote
        style={{
          padding: '4px 16px',
          borderLeft: '2px solid #c9ced6',
          color: '#5f6a7a',
        }}
        {...rest}
      />
    )
  }, [])

  return (
    <div className={cx(prefix, className)}>
      <Markdown
        className={cx(prefix, className)}
        remarkPlugins={[remarkGfm, breaks]}
        rehypePlugins={[rehypeRaw]}
        children={markdownData}
        components={{
          mybr: renderMyBr,
          myat: renderMyAt,
          mylight: renderMyLight,
          ol: renderMyOl,
          li: renderMyLi,
          input: renderMyInput,
          hr: renderMyHr,
          img: renderMyImg,
          a: renderMyLink,
          blockquote: renderMyBlockquote,
          strong: useCallback((props) => {
            const { node, ...rest } = props
            return <strong className='my-strong' {...rest} />
          }, []),
          h1: useCallback((props) => {
            const { node, ...rest } = props
            return <h1 className='my-h1' {...rest} />
          }, []),
          h2: useCallback((props) => {
            const { node, ...rest } = props
            return <h2 className='my-h2' {...rest} />
          }, []),
          h3: useCallback((props) => {
            const { node, ...rest } = props
            return <h3 className='my-h3' {...rest} />
          }, []),
          h4: useCallback((props) => {
            const { node, ...rest } = props
            return <h4 className='my-h4' {...rest} />
          }, []),
          h5: useCallback((props) => {
            const { node, ...rest } = props
            return <h5 className='my-h5' {...rest} />
          }, []),
          h6: useCallback((props) => {
            const { node, ...rest } = props
            return <h6 className='my-h6' {...rest} />
          }, []),
        }}
      />
      {showImgPreview && (
        <div
          className='image-preview'
          onClick={() => {
            setShowImgPreview(false)
          }}
        >
          {/* <Icon className="image-preview__close" name="close-circle" style={{ fontSize: '24px' }} /> */}
          <img className='image-preview__img' src={curImgSrc} />
        </div>
      )}
    </div>
  )
}

export default MarkdownPreview
