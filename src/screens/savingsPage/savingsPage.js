import { Alert, AlertTitle } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import React, { useEffect } from 'react';
import { AmountInput, StyledInputBase } from './styledInputBase';

const WITHDRAW = "withdraw"
const DEPOSIT = "deposit"

// currently not used, left as stretch
const SavingsPage = () => {
    const [depositAmountIntoSavingsAccount, setDepositAmountIntoSavingsAccount] = React.useState(0)
    const [withdrawAmountFromSavingsAccount, setWithdrawAmountFromSavingsAccount] = React.useState(0)
    const [spendingPower, setSpendingPower] = React.useState(0)
    const [savingsTotal, setSavingsTotal] = React.useState(0)
    const [displayErrorMsg, setDisplayErrorMsg] = React.useState("")
    const [errorMsg, setErrorMsg] = React.useState("")


    const handleOnChangeWithdraw = (e) => {
        const re = /^[0-9]+$/
        if (e.target.value === '' || re.test(e.target.value)) {
            setWithdrawAmountFromSavingsAccount(e.target.value)
        }
    }

    const handleOnChangeDeposit = (e) => {
        const re = /^[0-9]+$/
        if (e.target.value === '' || re.test(e.target.value)) {
            setDepositAmountIntoSavingsAccount(e.target.value)
        }
    }

    // The getSpendingPower function makes an axios get request that receives the user’s spending power.
    const getSpendingPowerSavingsAmount = () => {
        var headers = {
            'accept': 'application/json',
        };

        var data = {
            email: 'testuser@gmail.com',
        }

        var options = {
            method: 'GET',
            url: `${process.env.REACT_APP_BACKEND_API}/portfolios/`,
            headers: headers,
            params: data
        };

        axios(options).then(res => {
            setSpendingPower(res.data.portfolios[0].spendingPower.$numberDecimal)
            setSavingsTotal(res.data.portfolios[0].savingsTotal.$numberDecimal)
        })
    }

    // positive amt for withdrawal, negative amt for deposit
    const updateSavingsTotal = (amt) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("email", "testuser@gmail.com");
        urlencoded.append("amount", amt);
        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch(`${process.env.REACT_APP_BACKEND_API}/portfolios/withdrawSavings`, requestOptions)
            .then(res => res.json())    
            .then(res => {
                console.log(res)
                setSpendingPower(res.spendingPower.$numberDecimal)
                setSavingsTotal(res.savingsTotal.$numberDecimal) 
            })
            .catch(error => console.log('error', error));
    }

    const handleUpdateSavingsTotal = (e) => {
        e.preventDefault()
        if (e.target.id == WITHDRAW) {
            if (savingsTotal - withdrawAmountFromSavingsAccount < 0) {
                setErrorMsg("Your withdraw amount exceeds your savings total.")
                setDisplayErrorMsg(true)
            } else {
                updateSavingsTotal(withdrawAmountFromSavingsAccount)
            }
        } else if (e.target.id == DEPOSIT) {
            if (depositAmountIntoSavingsAccount > spendingPower) {
                setErrorMsg("Cannot deposit more money into your savings account than your spending power.")
                setDisplayErrorMsg(true)
            } else {
                updateSavingsTotal(-depositAmountIntoSavingsAccount)
            }
        }
    }

    useEffect(() => {
        getSpendingPowerSavingsAmount()
    }, [])

    return (
        <div>
            {
                displayErrorMsg ?
                    <Alert severity="error" onClose={() => setDisplayErrorMsg(false)} sx={{ marginBottom: '32px', marginTop: '16px' }}>
                        <AlertTitle>Error</AlertTitle>
                        {errorMsg}
                    </Alert>
                    : null
            }

            <Typography variant="h4" className="font-link"> Savings Page</Typography>

            <Typography variant="h6" className="font-link">Spending Power: {Math.round(spendingPower * 100) / 100}</Typography>

            <Typography variant="h6" className="font-link">Total Savings: {Math.round(savingsTotal * 100) / 100}</Typography>
            
            <Typography variant="h6" className="font-link"> Annual interest rate of 1% is compounded monthly. </Typography>

            <AmountInput>
                <StyledInputBase
                    placeholder="1000"
                    onChange={handleOnChangeWithdraw}
                    value={withdrawAmountFromSavingsAccount}
                    type="number"
                    inputProps={{ min: 0, max: savingsTotal }}
                />
            </AmountInput>
            <Button variant="contained" color="primary" id={WITHDRAW} onClick={handleUpdateSavingsTotal}>Withdraw Amount From Savings Account</Button>

            <AmountInput>
                <StyledInputBase
                    placeholder="1000"
                    onChange={handleOnChangeDeposit}
                    value={depositAmountIntoSavingsAccount}
                    type="number"
                    inputProps={{ min: 0, max: spendingPower }}
                />
            </AmountInput>
            <Button variant="contained" color="primary" id={DEPOSIT} onClick={handleUpdateSavingsTotal}>Deposit Amount into Savings Account</Button>

        </div>
    )
}

export default SavingsPage
