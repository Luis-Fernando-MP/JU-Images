'use client'

import userStore from '@/app/(root)/(dashboard)/user.state'
import { CLD_PRESET } from '@/shared/lib/constants'
import { generateImageName } from '@/shared/lib/utils'
import { toast } from '@pheralb/toast'
import axios from 'axios'
import { cloudinaryLoader } from 'next-cloudinary'
import { type JSX, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import 'two-up-element'

import CustomDropzone from './Dropzone'
import { IRestoreValidator, restoreResolver } from './restore.resolver'

const Form = (): JSX.Element | null => {
  const { register, handleSubmit, formState, reset, setValue, getValues, watch } =
    useForm<IRestoreValidator>({
      mode: 'onChange',
      resolver: restoreResolver
    })
  const { errors: err, isValid } = formState
  const { _id } = userStore()
  const [image, setImage] = useState<string | null>(null)
  const { startChars, dateChars, randomChars } = useMemo(
    () => generateImageName(String(_id)),
    [_id]
  )

  if (!_id) return null
  const onError = (): void => {
    console.error('Error en el formulario:', err)
  }

  const onReset = (): void => {
    reset()
  }

  const onSubmit = async (data: IRestoreValidator): void => {
    console.log('Datos del formulario:', data)
    const idToast = toast.loading({
      text: 'Subiendo imagen',
      id: 2001
    })
    await uploadToCloudinary(data.image)
  }
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLD_PRESET)
    formData.append('public_id', `${String(_id)}/${randomChars}`)

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dkbp71nof/image/upload',
        formData
      )
      console.log('all --> ', response)
      console.log('subido --> ', response.data.secure_url)
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary', error)
    } finally {
      // setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <h2 className='text-2xl font-bold'>Ingresa un titulo:</h2>
      <p className='bg-red-300'>{err.title?.message}</p>

      <div className='flex items-center justify-center rounded-xl p-3'>
        <p className='bg-slate-300'>
          {startChars}/{dateChars}-
        </p>
        <input
          className='w-max min-w-9 bg-slate-200 px-1'
          type='search'
          autoComplete='off'
          placeholder={randomChars}
          {...register('title', {
            onChange(event) {
              console.log(event)
            }
          })}
        />
      </div>
      <h2 className='text-2xl font-bold'>Escoge tu imagen:</h2>
      <p className='bg-red-300'>{err.publicId?.message}</p>

      <input disabled className='bg-green-200' {...register('publicId')} />
      <CustomDropzone
        setPublicIdField={(image, temporalLink) => {
          setValue('image', image)
          setValue('publicId', temporalLink)
        }}
      />

      <div className='m-8'>
        <button type='submit' className='bg-purple-300 p-4'>
          Continuar
        </button>
        <button type='button' onClick={onReset}>
          Limpiar campos
        </button>
      </div>
    </form>
  )
}

export default Form
