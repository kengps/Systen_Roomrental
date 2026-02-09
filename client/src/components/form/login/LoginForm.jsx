import React, { useState } from 'react'
import {
    Avatar,
    Typography,
    TextField,
    Button,
    Box,
    InputAdornment,
    OutlinedInput,
    InputLabel,
    FormControl,
    Paper,
    Container,
    Fade,
    Slide
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Row, Col } from 'antd';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import IconButton from '@mui/material/IconButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import bg from '../../../img/pattern_h.png'
import room_bg from '../../../img/room.jpeg'

import { LockOutlined, UserOutlined, PoweroffOutlined } from '@ant-design/icons';



const LoginForm = ({ register, errors, handleSubmit, onSubmit, loadings, imgBg }) => {

    const cardStyle = {
        overflowX: "hidden",
        backgroundImage: `url(${imgBg})`, // ใช้เส้นทางสัมพัทธ์
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        boxShadow:
            " rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px",
        backgroundColor: "#15283c",
    }

    const loginCardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
        }
    }

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
            <Row style={{ height: '100vh', margin: 0 }}>
                <Col xs={0} sm={12} md={12} style={cardStyle} />

                <Col xs={24} sm={12} md={12} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    padding: '20px'
                }}>
                    <Fade in={true} timeout={800}>
                        <Paper elevation={0} sx={loginCardStyle}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Avatar sx={{
                                    m: '0 auto 16px',
                                    width: 64,
                                    height: 64,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                                }}>
                                    <LockOutlinedIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Typography component="h1" variant="h4" sx={{
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}>
                                    Welcome Back
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Sign in to your account
                                </Typography>
                            </Box>

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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                            borderWidth: 2,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea',
                                    }
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleOutlinedIcon sx={{ color: '#667eea' }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            {/* Password Field */}
                            <FormControl
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.password}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                            borderWidth: 2,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea',
                                    }
                                }}
                            >
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
                                            <LockOutlinedIcon sx={{ color: '#667eea' }} />
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                sx={{ color: '#667eea' }}
                                            >
                                                {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                />
                                {/* แสดง error ข้อความ */}
                                {errors.password && (
                                    <Typography variant="body2" color="error" sx={{ mt: 1, ml: 2 }}>
                                        {errors.password.message}
                                    </Typography>
                                )}
                            </FormControl>

                            {/* Submit Button */}
                            <LoadingButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0px)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                                loading={loadings}
                            >
                                Sign In
                            </LoadingButton>
                        </Paper>
                    </Fade>
                </Col>
            </Row>
        </Box>
    )
}

export default LoginForm