import React, { useState } from 'react'
import { Paper, Avatar, Typography, TextField, Button, Box, Container, InputAdornment, OutlinedInput, InputLabel, FormControl } from '@mui/material';


import { Row, Col, Grid } from 'antd';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import IconButton from '@mui/material/IconButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import bg from '../../../img/pattern_h.png'

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const cardStyle = {
    overflowX: "hidden",
    backgroundImage: `url(${bg})`, // ใช้เส้นทางสัมพัทธ์
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    boxShadow:
        " rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px",
    backgroundColor: "#15283c",
}
const LoginForm = ({ register, errors, handleSubmit, onSubmit }) => {

    //Toggle show password
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };


    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Row style={{ height: '100vh' }}>
                <Col xs={0} sm={12} md={12} style={cardStyle} />

                <Col xs={24} sm={12} md={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <Box sx={{ width: '80%', maxWidth: 400 }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main', mx: 'auto' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5" align="center">
                            Sign in
                        </Typography>

                        {/* Username Field */}
                        <TextField
                            fullWidth
                            label="Username"
                            margin="normal"
                            {...register('username', {
                                required: 'Username is required',
                                minLength: {
                                    value: 3,
                                    message: 'Username must be at least 3 characters',
                                },
                            })}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircleOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                },
                            }}

                        />

                        {/* Password Field */}
                        <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.password}>
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon />
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                            {/* แสดง error ข้อความ */}
                            {errors.password && (
                                <Typography variant="body2" color="error">
                                    {errors.password.message}
                                </Typography>
                            )}
                        </FormControl>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Col>
            </Row>
        </Box>
    )
}

export default LoginForm