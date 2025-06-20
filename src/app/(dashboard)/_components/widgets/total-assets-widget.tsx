
export const TotalAssetsWidget = () => {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center  gap-10">
       <h1 className="text-secondary h-2 pb-3 text-lg font-semibold mb-4">Total Asset Value</h1>
       <div className="border border-gray-400 w-[320px] p-2 rounded-xl">
        <h1 className="text-[#5C9FAD] text-left text-3xl pl-5">₹384.92 Cr</h1>
       </div>
      </div>
    </div>
  )
}



export const PreviewTotalAssetsWidget = () => {
  return (
    <div className="bg-white p-4 rounded-md border-gray-200 border shadow-md">
      <div className="flex flex-col  gap-3">
       <h1 className="text-secondary h-2 pb-3 text-sm
        font-semibold mb-4">Total Asset Value</h1>
       <div className="border border-gray-400 w-[320px] p-2 rounded-md">
        <h1 className="text-[#5C9FAD] text-left text-3xl">₹384.92 Cr</h1>
       </div>
      </div>
    </div>
  )
}


