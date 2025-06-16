import React from 'react'
import { useParams } from 'react-router-dom'

export default function ViewArticle() {
  const { id } = useParams()
  return <div>ViewArticle {id}</div>
}
