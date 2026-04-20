import os
import sys
import time

import paramiko


DEFAULT_HOST = os.environ.get("CRESTRON_HOST", "192.168.1.58")
DEFAULT_USER = os.environ.get("CRESTRON_USER", "tsiadmin")
DEFAULT_PASS = os.environ.get("CRESTRON_PASS", "tsiGearP@ss1985")
DEFAULT_PORT = int(os.environ.get("CRESTRON_PORT", "22"))


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: crestron_cmd.py "<command>" [host]', file=sys.stderr)
        return 2

    command = sys.argv[1]
    host = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_HOST
    user = DEFAULT_USER
    password = DEFAULT_PASS
    port = DEFAULT_PORT

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(
            hostname=host,
            port=port,
            username=user,
            password=password,
            look_for_keys=False,
            allow_agent=False,
            timeout=10,
        )

        channel = client.invoke_shell()
        time.sleep(0.5)

        # Flush banner/prompt before sending command
        if channel.recv_ready():
            _ = channel.recv(65535)

        channel.send(command + "\r\n")
        time.sleep(1.0)

        # Read response
        output = ""
        while channel.recv_ready():
            output += channel.recv(65535).decode("utf-8", errors="ignore")
            time.sleep(0.1)

        print(output.strip())
        return 0

    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    finally:
        try:
            client.close()
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())