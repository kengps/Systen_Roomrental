import { useLocation } from "react-router-dom";

const TestPage = () => {
    const { state } = useLocation()
    console.log(`⩇⩇:⩇⩇🚨 ~ TestPage ~ state :`, state);


    return (
        <div>Test.Page {state}</div>
    )
}

export default TestPage