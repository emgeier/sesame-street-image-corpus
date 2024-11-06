import React from "react";

import { Authenticator, Divider } from "@aws-amplify/ui-react";
import CustomHeader from './CustomMessaging';
import SearchImageAttributes from "./SearchImageAttributes";
import EpisodeSearch from "./EpisodeSearch";
import ImageSearch from "./ImageSearch";



const Search: React.FC = () => {
 
  const components = {
    Header: CustomHeader,
  };
  return (
    <Authenticator hideSignUp className="authenticator-popup" components={components}>
                    {({  }) => (
    <div>
      <main className='main-content'>
        <br/>
        <br/>
        <br/>
        <ImageSearch/>
        <Divider></Divider>
        <EpisodeSearch/>
        <Divider/>
        <SearchImageAttributes/>
        <Divider/>
      </main>
    </div>
)}
</Authenticator>
  );
};

export default Search;
