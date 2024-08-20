
import { View, useTheme } from '@aws-amplify/ui-react';

const CustomHeader = () => {
  const { tokens } = useTheme();

  return (
    <View textAlign="center" padding={tokens.space.large}>
      <h2>Website in development. Account creation not permitted.</h2>
    </View>
  );
};

export default CustomHeader;
