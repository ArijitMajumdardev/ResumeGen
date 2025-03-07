import { RichTextEditor } from '@/components/custom/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useResumeInfo } from '@/context/ResumeInfoProvider'
import { IterationCcw, LoaderCircle } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const formField={
  title:'',
  companyName:'',
  city:'',
  state:'',
  startDate:'',
  endDate:'',
  workSummery:'',

}

interface IexperienceList{
  updated: Experience[]
  newAdded:Experience[]
}


const Experience = () => {
  const [experinceList,setExperinceList]=useState<IexperienceList>({updated:[],newAdded:[]});
  const {resumeInfo,setResumeInfo}=useResumeInfo()
  const params=useParams();
  const [loading, setLoading] = useState(false);
  

  // useEffect(() => {
  //   if(resumeInfo?.experiences!==undefined)
  //     resumeInfo?.experiences.length>0&&setExperinceList(resumeInfo?.experiences as Experience[])
      
  // }, [])
  
  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newEntries=resumeInfo?.experiences.slice()!;
    const {name,value}=event.target;
    if (name in newEntries[index]) {
      newEntries[index] = {
        ...newEntries[index],
        [name]: value,
      };
    }
    console.log(newEntries)
    setExperinceList((prevList :IexperienceList) => {
      let updatedList = prevList.updated
      const existingEntryIndex = updatedList.findIndex((exp) => exp.id === newEntries[index].id)
      if (existingEntryIndex !== -1) {
        // If the entry already exists, update it
        updatedList[existingEntryIndex]=newEntries[index]
        return {...prevList,updated : updatedList}
      } else {
        // If the entry is new, add it
        updatedList = [...updatedList, newEntries[index]];
      return {...prevList,updated : updatedList}

      }

    });
    setResumeInfo((prev: IResumeInfo | undefined) => { return { ...prev, experiences: newEntries } as IResumeInfo })
    console.log("list ",experinceList)
    
  }

  const AddNewExperience = () => {
    setExperinceList([...experinceList, formField])
  }
  const RemoveExperience = () => {
    let newEntries = experinceList.slice();
    newEntries = newEntries.slice(0, -1);
    setExperinceList(newEntries)
    setResumeInfo((prev: IResumeInfo|undefined) => { return { ...prev, experiences: newEntries } as IResumeInfo })
    
  }
  const onSave = async () => {
    const hasEmptyFields = experinceList.some((exp) =>
      Object.values(exp).some((value) =>
        typeof value === "string" && value.trim() === ""
      )
    );
  
    if (hasEmptyFields) {
      alert("Please fill in all fields before saving.");
      return;
    }
  
    console.log(resumeInfo?.experiences)

    const newExperiences = experinceList.filter((exp) => !exp.id);
    const updatedExperiences = experinceList.filter((exp) => exp.id);
  
    try {
      setLoading(true);
      await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newExperiences, updatedExperiences }),
      });
      console.log(newExperiences)
      console.log(updatedExperiences)

  
      setLoading(false);
    } catch (error) {
      console.error("Error saving experiences:", error);
      setLoading(false);
    }
  }




  return (
    <div>
    <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
    <h2 className='font-bold text-lg'>Professional Experience</h2>
    <p>Add Your previous Job experience</p>
    <div>
        {resumeInfo?.experiences.map((item,index)=>(
            <div key={index}>
                <div className='grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg'>
                    <div>
                        <label className='text-xs'>Position Title</label>
                        <Input name="title" 
                        onChange={(event)=>handleChange(index,event)}
                        defaultValue={item?.title}
                        />
                    </div>
                    <div>
                        <label className='text-xs'>Company Name</label>
                        <Input name="companyName" 
                        onChange={(event)=>handleChange(index,event)}
                        defaultValue={item?.companyName} />
                    </div>
                    <div>
                        <label className='text-xs'>City</label>
                        <Input name="city" 
                        onChange={(event)=>handleChange(index,event)} 
                        defaultValue={item?.city}/>
                    </div>
                    <div>
                        <label className='text-xs'>State</label>
                        <Input name="state" 
                        onChange={(event)=>handleChange(index,event)}
                        defaultValue={item?.state}
                         />
                    </div>
                    <div>
                        <label className='text-xs'>Start Date</label>
                        <Input   
                        name="startDate" 
                        onChange={(event)=>handleChange(index,event)} 
                        defaultValue={item?.startDate}/>
                    </div>
                    <div>
                        <label className='text-xs'>End Date</label>
                        <Input  name="endDate" 
                        onChange={(event)=>handleChange(index,event)} 
                        defaultValue={item?.endDate}
                        />
                    </div>
                    <div className='col-span-2'>
                       {/* Work Summery  */}
                       {/* <RichTextEditor
                       index={index}
                       defaultValue={item?.workSummery}
                       onRichTextEditorChange={(event)=>handleRichTextEditor(event,'workSummery',index)}  /> */}
                <RichTextEditor />
                    </div>
                </div>
            </div>
        ))}
    </div>
    <div className='flex justify-between'>
        <div className='flex gap-2'>
        <Button variant="outline" onClick={AddNewExperience} className="text-primary"> + Add More Experience</Button>
        <Button variant="outline" onClick={RemoveExperience} className="text-primary"> - Remove</Button>

        </div>
        <Button disabled={loading} onClick={()=>onSave()}>
        {loading?<LoaderCircle className='animate-spin' />:'Save'}    
        </Button>
    </div>
    </div>
</div>
  )
}

export default Experience