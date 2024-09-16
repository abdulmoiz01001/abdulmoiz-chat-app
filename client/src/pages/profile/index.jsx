import { useAppStore } from '@/store/store'
import { IoArrowBack } from 'react-icons/io5'
import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'
import { colors, getColor } from '@/lib/utils'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ADD_PROFILE_IMAGE_ROUTE, DELETE_PROFILE_IMAGE_ROUTE, HOST, UPDATE_PROFILE_ROUTE } from '@/utils/constants'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

const Profile = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useAppStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [image, setImage] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const [error, setError] = useState({
    firstName: null,
    lastName: null
  })

  useEffect(()=>{
    if(userInfo.profileSetup){
      setFirstName(userInfo.firstName)
      setLastName(userInfo.lastName)
      setSelectedColor(userInfo.color)
    }
    if(userInfo.image){
      setImage(`${HOST}/${userInfo.image}`)
    }
  },[userInfo])

  const handlefileInputClick = (e) => {
    fileInputRef.current.click()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    console.log({file})
    if(file){
      const formData = new FormData()
      formData.append('profile-image', file)
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, { withCredentials: true })
      if(response.status === 200 && response.data.image){
        setUserInfo({ ...userInfo, image: response.data.image})
        toast.success('Image uploaded successfully')
      }

      // const reader = new FileReader()
      // reader.onload = () => {
      //   setImage(reader.result);
      // }
      // reader.readAsDataURL(file);

    }
  }

  const handleDeleteImage = async () => {
    try{
       const response = await apiClient.delete(DELETE_PROFILE_IMAGE_ROUTE , {withCredentials: true} )
       if(response.status === 200){
        setUserInfo({ ...userInfo, image: null});
        toast.success('Image deleted successfully')
        setImage(null);
       }
    }catch(err){
      console.log(err)
    }
  }



  console.log(userInfo)
  const validateProfile = () => {
    let isValid = true;

    if (!firstName) {
      setError((prevError) => ({
        ...prevError,
        firstName: 'First Name is required',
      }));
      isValid = false;
    } else {
      setError((prevError) => ({
        ...prevError,
        firstName: null,
      }));
    }

    if (!lastName) {
      setError((prevError) => ({
        ...prevError,
        lastName: 'Last Name is required',
      }));
      isValid = false;
    } else {
      setError((prevError) => ({
        ...prevError,
        lastName: null,
      }));
    }

    return isValid;
  };
  const saveChanges = async () => {
    if (validateProfile()) {
      console.log('Validated')
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTE, {
          firstName,
          lastName,
          color: selectedColor
        }, { withCredentials: true }
        )
        if (response.status === 200 && response.data.id) {
          setUserInfo({ ...response.data })
          toast.success('Profile Updated Successfully')
          navigate('/chat')
        }
      } catch (err) {
        console.log(err)
      }
    }
    setTimeout(() => {
      setError({
        firstName: null,
        lastName: null
      })
    }, 2000)
  }

  const handleNaviagate = () => {
    if (userInfo.profileSetup) {
      navigate('/chat')
    } else {
      toast.error('Please complete your profile setup')
    }
  };

  return (
    <div className='h-[100vh] bg-[#1b1c24] flex items-center justify-center  ' >
      <div className='  w-[80vw] gap-10 flex flex-col md:w-max' >
        <div onClick={handleNaviagate} >

          <IoArrowBack className='text-3xl m-4 cursor-pointer' color='white' />
        </div>
        {/* <div className='flex justify-start  items-center' >
      </div> */}
        <div className='flex  w-[600px] justify-evenly items-center  ' >
          <div
            className='h-full w-32 md:w-48 md:h-48 relative flex justify-center items-center '
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden " >
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
                 
              ) : (
                <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                  selectedColor
                )} `} >

                  {
                    firstName ? firstName.split("").shift()
                    : userInfo?.email.split("").shift()
                  }
                 
                </div>
              )}
            </Avatar>
            {hovered && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full '
              onClick={image ? handleDeleteImage : handlefileInputClick}
              >{image ?
                (<FaTrash className='text-white text-3xl cursor-pointer' />)
                : (<FaPlus className='text-white text-3xl cursor-pointer' />)
                }
              </div>
            )}
            <input type='file' ref={fileInputRef} onChange={handleImageChange} className='hidden' name='profile-image' accept='.jpg, .png, .jpeg, .svg, .webp' />
          </div>
          <div className='w-[50%] flex flex-col justify-center items-center gap-4' >
            <Input
              label='First Name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={userInfo?.firstName || 'First Name'}
            />
            {
              error.firstName && <p className='text-red-500 text-opacity-90' >{error.firstName}</p>
            }
            <Input
              label='Last Name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={userInfo?.lastName || 'Last Name'}
            />
            {
              error.lastName && <p className='text-red-500 text-opacity-90' >{error.lastName}</p>
            }
            <Input
              label='Email'
              value={userInfo?.email}
              disabled
            />


            <div className='flex items-center gap-2' >
              {colors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`h-8 w-8 rounded-full cursor-pointer ${color} ${selectedColor === index ? 'ring-2 ring-white' : ''}`}
                />
              ))}
            </div>
          </div>

        </div>
        <Button className='bg-purple-500 active:scale-95 text-white w-full py-3 rounded-lg' onClick={saveChanges} >Save Changes</Button>

      </div>
    </div>
  )
}

export default Profile
