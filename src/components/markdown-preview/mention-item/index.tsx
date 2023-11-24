import React, { useState } from 'react'
import { Popover } from 'antd'
import './index.scss'
import { fetchUsers } from '@/components/at-mentions-editor/tools'

interface IProps {
  userId: string
  userName: string
}

export const MentionItem = (props: IProps) => {
  const { userId, userName } = props
  const [showCard, setShowCard] = useState(false)

  const renderPersonCard = () => {
    let avatar = ''
    fetchUsers(userId, (data) => {
      avatar = data[0].avatar || ''
    })
    return (
      <div className='card-content'>
        <div className='card-content__header'>
          <img className='card-content__header__avatar' src={avatar} />
          <div className='card-content__header__mask' />
          <div className='card-content__header__name'>{userName}</div>
          <div className='card-content__header__id'>{userId}</div>
        </div>
        <div className='card-content__item' onClick={() => alert('点击了电话')}>
          电话： 123456789
        </div>
        <div className='card-content__item' onClick={() => alert('点击了地址')}>
          地址： 湖北省武汉市洪山区
        </div>
        <div className='card-content__item' onClick={() => alert('点击了个人主页')}>
          跳转个人主页
        </div>
      </div>
    )
  }

  return (
    <span className='mention-item'>
      <Popover
        overlayClassName='card'
        content={renderPersonCard()}
        trigger='click'
        placement='bottomLeft'
        arrow={false}
      >
        <span
          className='mention-item__mention'
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            setShowCard(!showCard)
          }}
        >
          {`@${userName}`}
        </span>
      </Popover>
    </span>
  )
}
