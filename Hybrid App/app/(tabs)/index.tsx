import React from "react";
import { View, StyleSheet } from "react-native";
import Ball from "../../components/Ball.tsx"; // Passe den Pfad an, falls nötig

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Ball />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
