import { Link,Outlet } from 'react-router-dom';
import './rootLayout.css';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';


//Import your publishable key
const PUBLISHABLE_KEY ="pk_test_c3RyaWtpbmctd2hpcHBldC04Ni5jbGVyay5hY2NvdW50cy5kZXYk";//import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('PUBLISHABLE_KEY:',PUBLISHABLE_KEY );

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}


const RootLayout = () => {
    return(
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <div className='rootLayout'>
                <header>
                    <Link to ="/"  className='logo'>
                        <img src="/logo.png" alt="" />
                        <span>NEOGPT</span>
                    </Link>
                    <div className="user">
                    
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    </div>
                </header>

                <main>
                    <Outlet/>
                </main>
            </div>
        </ClerkProvider>
    )
}

export default RootLayout


