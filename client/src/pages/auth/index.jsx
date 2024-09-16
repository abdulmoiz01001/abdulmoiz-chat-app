import React, { useState } from 'react'
import Victory from '../../assets/victory.svg'
import Background from '../../assets/login2.png'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from '@/components/ui/button'
import * as Yup from 'yup';
import { apiClient } from '@/lib/api-client'
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/utils/constants'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/store'
import { toast } from 'sonner'

const Auth = () => {
  const navigate = useNavigate()
  const { setUserInfo } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [ success , setSuccess] = useState(null)

  const SignupValidationSchema = Yup.object().shape({

    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password should be at least 8 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),

  });

  const LoginValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password should be at least 8 characters'),
  });

  const handleSignup = async () => {
    const formValues = {  email, password, confirmPassword };
    console.log('Form Values:', formValues);

    try {
     const validate = await SignupValidationSchema.validate(formValues, { abortEarly: false });
     if(!validate) {
      const validationErrors = {};
      err.inner.forEach(error => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      console.log('Validation Errors:', validationErrors);
      return;
     };
      setErrors({}); // Clear errors if validation is successful
      console.log('Form is valid');
      const response = await apiClient.post(SIGNUP_ROUTE, {email , password},{withCredentials: true});
      if (response.status === 201) {
        setUserInfo(response.data.user);
        navigate('/profile');
        console.log('User created successfully');
        setSuccess('User created successfully');
      }else{
        console.log('Error creating user');
      }
    } catch (err) {
      console.log('Error creating user:', err);
      
    }
  };


  const handleLogin = async () => {
    const formValues = { email, password }
    console.log('Form Values:', formValues);

    try {
    const validate = await LoginValidationSchema.validate(formValues, { abortEarly: false });
    if(!validate) {
      const validationErrors = {};
      err.inner.forEach(error => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      console.log('Validation Errors:', validationErrors);
      return;
    }
      setErrors({}); // Clear errors if validation is successful
      console.log('Form is valid');
      const response = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
      if (response.status === 200) {
        setUserInfo(response.data.user);
        if(response.data.user.profileSetup) navigate('/chat');
        else navigate('/profile');
      } else {
        console.log('Error logging in user');
        
      toast.error('Invalid email or password');
      }
    }
    catch (err) {
      console.log('Error logging in user:', err);
      // toast.error('Invalid email or password');
     
    }

  }


  return (
    <div className='h-[100vh] w-[100vw] flex items-center justify-center' >

      <div className='min-h-[80vh] py-4 bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw]  lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2 ' >
        <div className='flex flex-col gap-10 justify-center items-center' >
          <div className='flex items-center justify-center flex-col' >
            <div className='flex items-center justify-center' >
              <h1 className='text-5xl font-bold md:text-4xl' >Welcome Back</h1>
              <img src={Victory} alt='victory' className='h-[100px]' />
            </div>
            <p className='font-medium text-center' >
              To keep connected with us please login with your personal info
            </p>
          </div>
          <div className='flex items-center justify-center w-full' >
            <Tabs className='w-3/4' defaultValue='login' >
              <TabsList className="bg-transparent rounded-none w-full" >
                <TabsTrigger className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300" value="login" >Login</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300" value="signup" >Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-4 mt-4" value="login" >
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Email' />
                {
                  errors.email && <p className='text-red-500 text-opacity-90' >{errors.email}</p>
                }
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type='password' placeholder='Password' />
                {
                  errors.password && <p className='text-red-500 text-opacity-90' >{errors.password}</p>
                }
                <Button className='bg-purple-500 active:scale-95 text-white w-full py-3 rounded-lg' onClick={handleLogin} >Login</Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-4 mt-4 " value="signup" >

                <Input value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Email' />
                {errors.email && <p className='text-red-500 text-opacity-90'>{errors.email}</p>}

                <Input value={password} onChange={(e) => setPassword(e.target.value)} type='password' placeholder='Password' />
                {errors.password && <p className='text-red-500 text-opacity-90'>{errors.password}</p>}

                <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type='password' placeholder='Confirm Password' />
                {errors.confirmPassword && <p className='text-red-500 text-opacity-90'>{errors.confirmPassword}</p>}
                 
                 {
                  success && <p className='text-green-500 text-opacity-90' >{success}</p>
                 }

                <Button className='bg-purple-500 active:scale-95 text-white w-full py-3 rounded-lg' onClick={handleSignup} >Sign Up</Button>
              </TabsContent>
            </Tabs>
          </div>

        </div>
        <div className='hidden xl:flex justify-center items-center' >
          <img src={Background} alt='Background' className='h-[400px]' />
        </div>
      </div>
    </div>
  )
}

export default Auth
