import React from 'react'
import { FileUploader } from './common/file-uploader'
import { FileStorage } from './common/file-storage'

function FileController({excelData,deleteNote}:any) {
  return (
    <div className="h-full bg-white">
      <main className="min-h-screen  p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              File Storage
            </h1>
            <p className="mt-2 text-slate-600">
              Upload, manage and organize your Excel and ZIP files
            </p>
          </div>
          <div className="mt-10">
            <FileStorage excelData={excelData} deleteNote={deleteNote}/>
          </div>
        </div>
      </main>
    </div>
  )
}

export default FileController