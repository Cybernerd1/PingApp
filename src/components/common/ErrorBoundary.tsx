import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚡</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred in Ping. Don't worry, your data and matches are safe!
            </Text>
            {this.state.error?.message && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.btn} onPress={this.handleReset} activeOpacity={0.85}>
              <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { ...Typography.heading, fontSize: 22, color: Colors.plum, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...Typography.body, fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(242, 134, 95, 0.1)',
    borderRadius: Radius.small,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { ...Typography.caption, fontSize: 12, color: Colors.danger, fontFamily: 'monospace' },
  btn: {
    width: '100%',
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { ...Typography.bodyStrong, color: Colors.white, fontSize: 15 },
});
