import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useAppContext} from "./context/useContext";
import {ToastContainer} from "react-toastify";
import {
    Home,
    Login,
    Register,
    ForgetPassword,
    Error,
    ProtectedLayout,
    ShareLayout,
} from "./page";

import {Dashboard, Messenger, Admin, Game} from "./page/Layout";
import {Profile, UpdateProfile, SuggestFollow} from "./page/user";

import {Information} from "./page/Post";

const App = () => {
    const {dark} = useAppContext();
    return (
        <div className={`${dark ? "dark" : ""} relative `}>
            <ToastContainer
                position='top-right'
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme={dark ? "dark" : "light"}
            />

            <BrowserRouter>
                <Routes>
                    <Route
                        path='/'
                        element={
                            <ProtectedLayout>
                                <ShareLayout />
                            </ProtectedLayout>
                        }>
                        <Route
                            // @ts-ignore
                            index
                            path='/'
                            element={<Dashboard />}
                        />
                        <Route path='/messenger' element={<Messenger />} />
                        <Route
                            path='/game'
                            element={<Game rows={20} columns={10} />}
                        />
                        <Route path='/admin' element={<Admin />} />
                        <Route path='/profile/*' element={<Profile />} />
                        <Route
                            path='/suggest-follow'
                            element={<SuggestFollow />}
                        />
                        <Route
                            path='/update-profile'
                            element={<UpdateProfile />}
                        />
                        <Route
                            path='/post/information/:id'
                            element={<Information />}
                        />
                    </Route>

                    <Route path='/home' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />

                    <Route
                        path='/forget-password'
                        element={<ForgetPassword />}
                    />

                    <Route path='*' element={<Error />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
