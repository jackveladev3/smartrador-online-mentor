<template>
  <div class="home">
    <SignIn />
  </div>
</template>

<script>
// @ is an alias to /src
import SignIn from '@/components/sign-in'

export default {
  name: 'Login',
  components: {
    SignIn
  },
  mounted () {
    this.$emit('loggedIn', true)
  }
}
</script>
