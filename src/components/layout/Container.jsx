export default function Container({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-4 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  )
}
