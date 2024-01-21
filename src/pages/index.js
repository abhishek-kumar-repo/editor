import Image from 'next/image'
import { Inter } from 'next/font/google'
import Editor from './editor'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Editor />
  )
}
