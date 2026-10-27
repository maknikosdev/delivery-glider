import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// Last line of defence: if any screen throws while rendering, the player gets
// a restart button instead of a frozen/blank app. Progress is saved
// separately, so restarting never loses it.
export default class ErrorBoundary extends React.Component {
  state = { failed: false, key: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn("[ErrorBoundary]", error && error.message);
  }

  restart = () => this.setState((s) => ({ failed: false, key: s.key + 1 }));

  render() {
    if (this.state.failed) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Κάτι πήγε στραβά · Something went wrong</Text>
          <Text style={styles.sub}>Η πρόοδός σου είναι ασφαλής. · Your progress is safe.</Text>
          <Pressable onPress={this.restart} style={styles.btn} hitSlop={10}>
            <Text style={styles.btnText}>ΕΠΑΝΕΚΚΙΝΗΣΗ · RESTART</Text>
          </Pressable>
        </View>
      );
    }
    return <React.Fragment key={this.state.key}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#05030d", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "#ffffff", fontSize: 18, fontWeight: "800", textAlign: "center" },
  sub: { color: "#9b97b5", fontSize: 13, marginTop: 8, textAlign: "center" },
  btn: { marginTop: 22, borderWidth: 2, borderColor: "#28e0ff", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22 },
  btnText: { color: "#28e0ff", fontWeight: "900", letterSpacing: 1 },
});
