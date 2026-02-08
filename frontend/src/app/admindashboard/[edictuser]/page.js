'use client'
import EditForm from "../components/EditForm"
import { use } from 'react'
export default  function page({params}) {


    const {edictuser} = use(params) ;
    

  return (
    <>
    <EditForm
        id = {edictuser}
    />
    </>
  )
}
