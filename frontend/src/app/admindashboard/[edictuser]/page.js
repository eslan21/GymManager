'use client'
import EditForm from "../components/EditForm"
import { use } from 'react'
export default function Page({ params }) {


  const { edictuser } = use(params);


  return (
    <>
      <EditForm
        id={edictuser}
      />
    </>
  )
}
