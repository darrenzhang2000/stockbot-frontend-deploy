import { Alert, AlertTitle, Button } from '@mui/material';
import axios from 'axios';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";

// This button adds the stock in the stock info page to be tracked by
// our trading algorithm. We felt that this button was complex enough that
// we decided to refactor it into its own component. The button sends
// an axios post request to our backend that adds the stock ticker to the 
// list of tickers currently tracked by the trading algorithm.
const TrackedStockButton = (props) => {
    var email = useSelector(state => state.login.user)
    var [stockTrackedByAlgo, setStockTradedByAlgo] = React.useState(false)
    const { ticker } = props
    const [displayAlert, setDisplayAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    // call to backend to see if stock is tracked by the trading algo
    const checkIfStockTracked = (e) => {
        var config = {
            method: 'get',
            url: `${process.env.REACT_APP_BACKEND_API}/trackedStocks/ticker/?email=${email}&ticker=${ticker}`,
        };

        axios(config)
            .then(function (response) {
                setStockTradedByAlgo(response.data.hasTrackedStock)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const handleRemoveTrackedStock = (e) => {
        var axios = require('axios');
        var qs = require('qs');
        var data = qs.stringify({
            'email': email,
            'ticker': ticker
        });
        var config = {
            method: 'delete',
            url: `${process.env.REACT_APP_BACKEND_API}/trackedStocks/`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                setStockTradedByAlgo(false)
                console.log(JSON.stringify(response.data));
                setErrorMsg(`${ticker} is removed from being tracked by the trading algoirthm.`)
                setDisplayAlert(true)
                setTimeout(() => setDisplayAlert(false), 10000)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const handleAddTrackedStock = (e) => {
        e.preventDefault()

        var headers = {
            'accept': 'application/json',
        };

        var data = {
            email: email,
            ticker
        }

        var options = {
            method: 'POST',
            url: `${process.env.REACT_APP_BACKEND_API}/trackedStocks`,
            headers: headers,
            data: qs.stringify(data)
        };

        axios(options).then(res => {
            setStockTradedByAlgo(true)
            setErrorMsg(`${ticker} is successfully being tracked by the trading algoirthm.`)
            setDisplayAlert(true)
            setTimeout(() => setDisplayAlert(false), 10000)
            console.log(res)
        })
    }

    useEffect(() => {
        checkIfStockTracked()
    }, [ticker, stockTrackedByAlgo])

    return (
        <div>
            {!stockTrackedByAlgo ? <Button sx={{ marginBottom: '32px', paddingLeft: '64px', paddingRight: '64px' }} variant="contained" color="primary" onClick={handleAddTrackedStock}>Add Stock {ticker} To Be Tracked By the Trading Algorithm</Button>
                : <Button sx={{ paddingLeft: '64px', paddingRight: '64px', marginBottom: '32px' }} variant="contained" color="primary" onClick={handleRemoveTrackedStock}>Remove Stock {ticker} From Being Tracked By the Trading Algorithm</Button>
            }
            {
                displayAlert ?
                    <Alert severity="success" onClose={() => setDisplayAlert(false)}>
                        <AlertTitle>Success</AlertTitle>
                        {errorMsg}
                    </Alert>
                    : null
            }
        </div>
    )
}

export default TrackedStockButton
