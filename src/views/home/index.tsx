import React, { useState } from 'react'
import { AtMentionsEditor } from '@/components/at-mentions-editor'
import { IMention } from '@/components/at-mentions-editor/types'
import './index.scss'
import MarkdownPreview from '@/components/markdown-preview'
import { initData, initMentions } from './data'

function Home() {
  const [pureString, setPureString] = useState(initData)
  const [mentionList, setMentionList] = useState<IMention[]>(initMentions)
  return (
    <div>
      <div className='home'>
        {/* @编辑器部分 */}
        <div style={{ flex: 1 }}>
          <div className='home__title'>@编辑器：</div>
          <div className='home__tip'>「输入@字符弹出人员搜索选择」</div>
          <AtMentionsEditor
            className='home__editor'
            value={pureString}
            mentions={mentionList}
            onChange={(value, mentions) => {
              console.log('test', JSON.stringify(value), mentions)
              setPureString(value)
              setMentionList(mentions)
            }}
            minHeight={200}
            placeholder='请输入文本'
          />
        </div>
        {/* 结果展示部分 */}
        <div style={{ marginLeft: '50px', flex: 1 }}>
          <div className='home__title'>Markdown渲染展示：</div>
          <div className='home__tip'>「点击@人员展示个人卡片」</div>
          <MarkdownPreview mentions={mentionList}>{pureString}</MarkdownPreview>
        </div>
      </div>
    </div>
  )
}

export default Home
