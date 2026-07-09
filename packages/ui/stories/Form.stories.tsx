import type { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../src/components/ui/form'
import { Input } from '../src/components/ui/input'
import { Button } from '../src/components/ui/button'
import { Textarea } from '../src/components/ui/textarea'

const meta = {
  title: 'Components/Form',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<any>

export default meta
type Story = StoryObj<typeof meta>

type FormValues = {
  username: string
  email: string
}

export const Default: Story = {
  args: {},
  render: () => {
    const form = useForm<FormValues>({
      defaultValues: {
        username: '',
        email: '',
      },
    })

    function onSubmit(values: FormValues) {
      console.log(values)
      alert(`Username: ${values.username}, Email: ${values.email}`)
    }

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-[400px] space-y-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    )
  },
}

type ProfileFormValues = {
  bio: string
}

export const WithTextarea: Story = {
  args: {},
  render: () => {
    const form = useForm<ProfileFormValues>({
      defaultValues: {
        bio: '',
      },
    })

    function onSubmit(values: ProfileFormValues) {
      console.log(values)
      alert(`Bio: ${values.bio}`)
    }

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-[400px] space-y-6"
        >
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about yourself" {...field} />
                </FormControl>
                <FormDescription>
                  You can write up to 160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update profile</Button>
        </form>
      </Form>
    )
  },
}
