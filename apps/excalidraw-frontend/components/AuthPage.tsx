import { Button } from "@repo/ui/button";


export function AuthPage({isSignin}: {isSignin: boolean}){

    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-6 m-2 bg-white rounded">
            <div>
                <input type = "text" placeholder="Email"></input>
            </div>
            <div>
                <input type = "password" placeholder="Password"></input>
            </div>
            <div>
                <Button className="bg-red-400" variant="primary" size = "lg" >{isSignin? "Sign in": "Sign up"}</Button>
            </div>
        </div>

    </div>
}