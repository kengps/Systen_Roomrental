import React, { Fragment } from 'react'
import Grid from '@mui/material/Grid'
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';

const useStyles = makeStyles(theme => ({
}));

export default function Account({ register, errors, data }) {
    const classes = useStyles();



    return (
        <Fragment>
            <div className={classes.root}>
                <Grid container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    spacing={1}
                >
                    <Grid item md={12} xs={12}>

                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            {...register('email', {
                                required: 'email is required',
                                minLength: {
                                    value: 3,
                                    message: 'email must be at least 3 characters',
                                },
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            defaultValue={data.email}

                        />

                        {errors.email && <p className={classes.errorMessage}>{errors.email.message}</p>}
                    </Grid>
                    <Grid item md={12} xs={12}>

                        <TextField
                            fullWidth
                            label="password"
                            margin="normal"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 3,
                                    message: 'Password must be at least 3 characters',
                                },
                            })}
                            
                            error={!!errors.Password}
                            helperText={errors.Password?.message}
                            defaultValue={data.Password}

                        />

                        {errors.Password && <p className={classes.errorMessage}>{errors.Password.message}</p>}
                    </Grid>
                </Grid>
                <Grid container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    spacing={1}
                >

                    <Grid item md={12} xs={12}>

                        <TextField
                            fullWidth
                            label="CPassword"
                            margin="normal"
                            {...register('confirmPassword', {
                                required: 'Confirm Password is required',
                                minLength: {
                                    value: 3,
                                    message: 'Confirm Password must be at least 3 characters',
                                },
                            })}
                            
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            defaultValue={data.confirmPassword}

                        />

                        {errors.confirmPassword && <p className={classes.errorMessage}>{errors.confirmPassword.message}</p>}
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    )
}