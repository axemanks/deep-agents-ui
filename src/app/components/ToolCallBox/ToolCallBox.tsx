"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Terminal,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./ToolCallBox.module.scss";
import { ToolCall } from "../../types/types";
import { getToolMeta } from "../../utils/toolMeta";

interface ToolCallBoxProps {
  toolCall: ToolCall;
}

export const ToolCallBox = React.memo<ToolCallBoxProps>(({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { name, args, result, status, meta, preview } = useMemo(() => {
    const toolName = toolCall.name || "Unknown Tool";
    const toolArgs = toolCall.args || "{}";
    let parsedArgs = {};
    try {
      parsedArgs =
        typeof toolArgs === "string" ? JSON.parse(toolArgs) : toolArgs;
    } catch {
      parsedArgs = { raw: toolArgs };
    }
    const toolResult = toolCall.result || null;
    const toolStatus = toolCall.status || "completed";
    const toolMeta = getToolMeta(toolName);
    const previewText = (() => {
      if (toolResult) {
        const str =
          typeof toolResult === "string"
            ? toolResult
            : JSON.stringify(toolResult);
        return str.split("\n")[0].slice(0, 50);
      }
      const argKeys = Object.keys(parsedArgs);
      if (argKeys.length > 0) {
        const key = argKeys[0];
        const val =
          typeof parsedArgs[key] === "string"
            ? parsedArgs[key]
            : JSON.stringify(parsedArgs[key]);
        return `${key}: ${val}`.slice(0, 50);
      }
      return "";
    })();

    return {
      name: toolName,
      args: parsedArgs,
      result: toolResult,
      status: toolStatus,
      meta: toolMeta,
      preview: previewText,
    };
  }, [toolCall]);

  const statusIcon = useMemo(() => {
    switch (status) {
      case "completed":
        return <CheckCircle className={styles.statusCompleted} />;
      case "error":
        return <AlertCircle className={styles.statusError} />;
      case "pending":
        return <Loader className={styles.statusRunning} />;
      default:
        return <Terminal className={styles.statusDefault} />;
    }
  }, [status]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const hasContent = result || Object.keys(args).length > 0;

  return (
    <div className={styles.container}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className={styles.header}
        disabled={!hasContent}
      >
        <div className={styles.headerLeft}>
          {hasContent && isExpanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
          {statusIcon}
          <meta.icon
            className={styles.toolIcon}
            style={{ color: meta.color }}
          />
          <span className={styles.toolName}>{name}</span>
          {preview && (
            <span className={styles.description}>{preview}</span>
          )}
        </div>
      </Button>

      {isExpanded && hasContent && (
        <div className={styles.content}>
          {Object.keys(args).length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Arguments</h4>
              <pre className={styles.codeBlock}>
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {result && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Result</h4>
              <pre className={styles.codeBlock}>
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ToolCallBox.displayName = "ToolCallBox";
