import {  useEffect, useState, useContext } from 'react';
import Link from "next/link";
import router from 'next/router';
import { Flex, Box,Text,Button,  useMediaQuery, Image, Center, Stack, Icon, Skeleton} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import Bounce from 'react-reveal/Bounce';
import Fade from 'react-reveal/Fade';
import Socials from '../components/social';
import { userDetailsContext } from '../components/userDetailsProvider';


const dashboard = () => {
    const [isLargerThan900] = useMediaQuery('(min-width: 900px)')
    const [isLesserThan900] = useMediaQuery('(max-width: 900px)')
    const bgColor = useColorModeValue('themeLight.bg', 'themeDark.bgBody')
    const iconColor = useColorModeValue('themeLight.icon', 'themeLight.icon');
    const [checkToken, setCheckToken] = useState(false);
    const [user, setUser] = useContext(userDetailsContext);

    useEffect(async () => {
        let token = JSON.parse(localStorage.getItem('token'))
        if(token === null){
          router.push('/login')
        }
        else{
          const res = await fetch(`/api/dashboard/?token=${token}`);
          const data = await res.json()
          if(res.status === 403){            
            localStorage.setItem('user', null)
            setCheckToken(true)
            router.push('/login')
        }
        else{
          let user = data
          localStorage.setItem('user', JSON.stringify(user))
          setUser(data)
        }
        }
        
        
    }, [])



  return (
    <>

    </>
  )
}


export default dashboard;