import { Link,Outlet } from 'react-router-dom';
import './rootLayout.css';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
console.log('PRE_PUBLISHABLE_KEY_TEST:' );
console.log(import.meta.env);  // This will log all available env variables

//Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
//import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
console.log('PUBLISHABLE_KEY_TEST:' );
console.log('PUBLISHABLE_KEY:',PUBLISHABLE_KEY );

/*if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
  console.log('PUBLISHABLE_KEY:');
  

}*/
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
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
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


//<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/"> </ClerkProvider>