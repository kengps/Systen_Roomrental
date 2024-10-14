import React, { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Typography, Button, StepLabel, Step, Stepper } from '@mui/material';
import Information from './Information';
import Account from './Account';
import { useForm } from 'react-hook-form';
import { object, string, ref } from 'yup';
import { StoreContext } from './StoreContextProvider ';
import { useContext } from 'react';

const useStyles = makeStyles(theme => ({}));

function getSteps() {
    return ['Information', 'Account'];
}

export default function StepperForm() {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();
    const [formData, setFormData] = React.useState({});
    // Separate state for each form section
    const [informationData, setInformationData] = React.useState({});
    const [accountData, setAccountData] = React.useState({});
    const informationSchema = object().shape({
        firstName: string().required('This field is required.'),
        lastName: string().required('This field is required.'),
        nickname: string().required('This field is required.'),
    });

    const accountingSchema = object().shape({
        email: string().email('Invalid email.').required('This field is required.'),
        password: string().required('This field is required.').min(3, 'Please Enter at least 3 letters'),
        confirmPassword: string()
            .required('This field is required.')
            .min(3, 'This field requires at least 3 characters.')
            .oneOf([ref('password'), null], 'Passwords do not match.'),
    });

    const informationForm = useForm({
        validationSchema: informationSchema
    });

    //Set validationSchema สำหรับ account
    const accountForm = useForm({
        validationSchema: accountingSchema
    });


    const { information, account } = useContext(StoreContext)



    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return <Information register={informationForm.register} errors={informationForm.formState.errors} data={information} />;
            case 1:
                return <Account register={accountForm.register} errors={accountForm.formState.errors} data={account} />;
            default:
                return 'Unknown stepIndex';
        }
    }

    // const handleInformationSubmit = (data) => {
    //     console.log(`⩇⩇:⩇⩇🚨  file: StepperForm.jsx:76  data :`, data);

    //     if (activeStep === 0) {
    //         //set data ให้ global state
    //         information[1](data)
    //     }

    //     handleNext();
    // };

    // const handleAccountSubmit = (data) => {
    //     console.log(`⩇⩇:⩇⩇🚨  file: StepperForm.jsx:87  data :`, data);

    //     if (activeStep === 1) {
    //         //set data ให้ global state
    //         account[1](data)
    //     }
    //     handleNext();
    // };

    const onSubmit = (data) => {
        // Merge current step data with the central form data
        setFormData(prevData => ({ ...prevData, ...data }));

        // Proceed to the next step
        handleNext();

        // If on the last step, send data to API
        if (activeStep === steps.length - 1) {
            
            const value = { ...formData, ...data }
            console.log(`⩇⩇:⩇⩇🚨  file: StepperForm.jsx:109  value :`, value);


            // Here you would send your API request
            // Example: await api.post('/your-endpoint', { ...formData, ...data });
        }
    }


    return (
        <div>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <div>
                {activeStep === steps.length ? (
                    <div>
                        <Typography>All steps completed</Typography>
                        <Button onClick={handleReset}>Reset</Button>
                    </div>
                ) : (
                    <div>
                        <form onSubmit={
                            activeStep === 0
                                ? informationForm.handleSubmit(onSubmit)
                                : accountForm.handleSubmit(onSubmit)
                        }>
                            <div>{getStepContent(activeStep)}</div>
                            <div>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                <Button variant="contained" color="primary" type="submit">
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
