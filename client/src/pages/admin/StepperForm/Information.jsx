import React, { Fragment } from 'react'

import { makeStyles } from '@mui/styles';

import { TextField, Grid, StepLabel, Step, Stepper } from '@mui/material';
const useStyles = makeStyles(theme => ({
}));


export default function Information({ register, errors, data }) {
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
                            label="Firstname"
                            margin="normal"
                            {...register('firstName', {
                                required: 'firstName is required',
                                minLength: {
                                    value: 3,
                                    message: 'firstName must be at least 3 characters',
                                },
                            })}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                            defaultValue={data.firstName}

                        />

                        {errors.firstName && <p className={classes.errorMessage}>{errors.firstName.message}</p>}

                    </Grid>
                    <Grid item md={12} xs={12}>

                        <TextField
                            fullWidth
                            label="Lastname"
                            margin="normal"
                            {...register('lastName', {
                                required: 'lastName is required',
                                minLength: {
                                    value: 3,
                                    message: 'lastName must be at least 3 characters',
                                },
                            })}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}

                            defaultValue={data.lastName}
                        />



                        {errors.lastName && <p className={classes.errorMessage}>{errors.lastName.message}</p>}
                    </Grid>
                </Grid>
                <Grid container
                    direction="row"
                    spacing={1}
                >
                    <Grid item md={12} xs={12}>
                        <Grid item md={12} xs={12}>
                         
                            <TextField
                                fullWidth
                                label="Nickname"
                                margin="normal"
                                {...register('nickname', {
                                    required: 'nickname is required',
                                    minLength: {
                                        value: 3,
                                        message: 'nickname must be at least 3 characters',
                                    },
                                })}
                                error={!!errors.nickname}
                                helperText={errors.nickname?.message}
                                defaultValue={data.nickname}


                            />

                          
                            {errors.nickname && <p className={classes.errorMessage}>{errors.nickname.message}</p>}
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    )
}