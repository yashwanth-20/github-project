import React from 'react'

const Login = () => {
    const handleLogin =()=>{
        window.location.href='/auth/github';
    }
  return (
    <div>
        <h2>Login Page</h2>
        <button onClick={handleLogin}>Login  with GitHub </button>
    </div>
  )
}

export default Login;